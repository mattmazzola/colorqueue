# ColorQueue

Library which takes a queue of colors and an instance of LED strip. It animates from color to color using the transition specified and sends the current color to the LED strip.

## Usage

Mostl likely this will be used within another preconfigured setup such as (colorqueue-firebase)[]

Create new ColorQueue:
```
import * as dotstar from 'dotstar';
import * as colorqueue from 'colorqueue';
const SPI = require('pi-spi');
spi = SPI.initialize('/dev/spidev0.0');

const ledStrip = new dotstar.Dotstar(spi, {
  length: 144
});

const colorqueue1 = new colorqueue.ColorQueue(ledStrip);
```
> The example below uses a DotStar led library but ColorQueue can be used with any thing that implements ILedStrip.

```
export interface ILedStrip {
  all(r: number, g: number, b: number, a?: number): void;
  set(led: number, r: number, g: number, b: number, a?: number): void;
  clear(): void;
  off(): void;
  sync(): void;
}
```

## Methods

Start the color queue

(Iterate through color transitions and update LEDs every X milliseconds based on configuration interval)
```
colorqueue.start();
```

Stop the color queue
```
colorqueue.clear();
```

Add color to internal list
```
colorqueue.add(color);
```

Remove color by order which is a unique id as millisecond timestamp
```
colorqueue.remove(color.order);
```

Remove all colors and turn LEDs off
```
colorqueue.clear();
```

## Interfaces

A color-transition interface
```
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
```