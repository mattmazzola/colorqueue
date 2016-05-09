import * as penner from 'pennerts';

export interface ILedStrip {
  all(r: number, g: number, b: number, a?: number): void;
  set(led: number, r: number, g: number, b: number, a?: number): void;
  clear(): void;
  off(): void;
  sync(): void;
}

export interface IColor {
  r: number,
  b: number,
  g: number,
  a: number
}

export interface IColorTransition extends IColor {
  duration: number;
  transition: string;
  order: number;
}

export class ColorQueue {
  colorTransitionIndex: number;
  colorTransitions: IColorTransition[];
  defaultTransitionFunction: penner.IPennerFunction;
  lastStartTime: number;
  lastColor: IColor;
  ledInterval: number;
  ledStrip: ILedStrip;
  ledUpdaterTimerId: NodeJS.Timer;
  
  constructor(ledStrip: ILedStrip, ledInterval: number = 100) {
    this.colorTransitionIndex = 0;
    this.colorTransitions = [];
    this.defaultTransitionFunction = penner.linear;
    this.lastColor = {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    };
    this.ledStrip = ledStrip;
    this.ledInterval = ledInterval;
  }
  
  set(colors: IColorTransition[]) {
    this.colorTransitions = colors;
  }
  
  add(color: IColorTransition) {
    this.colorTransitions.push(color);
  }
  
  remove(id: number) {
    let index = -1;
    
    this.colorTransitions.some((colorTransition, i) => {
      if(colorTransition.order === id) {
        index = i;
        return true;
      }
    });
    
    if(index !== -1) {
      this.colorTransitions.splice(index, 1);
      if(this.colorTransitionIndex >= this.colorTransitions.length) {
        this.colorTransitionIndex = 0;
      }
    }
  }
  
  clear() {
    this.colorTransitions.length = 0;
    this.colorTransitionIndex = 0;
    this.ledStrip.off();
  }
  
  start() {
    this.lastStartTime = (new Date()).getTime();
    this.ledUpdaterTimerId = setInterval(() => this.updateLeds(), this.ledInterval);
  }
  
  stop() {
    clearInterval(this.ledUpdaterTimerId);
    this.ledStrip.off();
  }
  
  private updateLeds() {
    if(!Array.isArray(this.colorTransitions) || this.colorTransitions.length <= 0) {
      return;
    }
    
    const currentTime = (new Date()).getTime();
    let timeAfterStart = currentTime - this.lastStartTime;
    let currentColorTransition = this.colorTransitions[this.colorTransitionIndex];
    
    if(timeAfterStart > currentColorTransition.duration) {
      this.lastColor = currentColorTransition;
      this.lastStartTime = this.lastStartTime + currentColorTransition.duration;
      timeAfterStart = timeAfterStart - currentColorTransition.duration;
      this.colorTransitionIndex = (this.colorTransitionIndex + 1) % this.colorTransitions.length;
      currentColorTransition = this.colorTransitions[this.colorTransitionIndex];
      console.log(`Switching to: colors[${this.colorTransitionIndex}]: ${JSON.stringify(currentColorTransition)}`);
    }
    
    const transitionFunction = penner[currentColorTransition.transition] || this.defaultTransitionFunction;
    const r = Math.round(transitionFunction(timeAfterStart, this.lastColor.r, currentColorTransition.r - this.lastColor.r, currentColorTransition.duration));
    const g = Math.round(transitionFunction(timeAfterStart, this.lastColor.g, currentColorTransition.g - this.lastColor.g, currentColorTransition.duration));
    const b = Math.round(transitionFunction(timeAfterStart, this.lastColor.b, currentColorTransition.b - this.lastColor.b, currentColorTransition.duration));
    const a = transitionFunction(timeAfterStart, this.lastColor.a, currentColorTransition.a - this.lastColor.a, currentColorTransition.duration);
    // console.log(`timeAfterStart: ${timeAfterStart}`);
    // console.log(`lastColor: ${JSON.stringify(this.lastColor)}`);
    // console.log(`nextColor: ${JSON.stringify(currentColorTransition)}`);
    // console.log(`currentColor: ${JSON.stringify({ r, g, b, a })}`);
    
    this.ledStrip.all(r, g, b, a);
    this.ledStrip.sync();
  }
}

export default ColorQueue;