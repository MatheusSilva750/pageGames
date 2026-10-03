import { createWorld } from 'koota';

export const gameWorld = createWorld();

export type Position = {
  x: number;
  y: number;
  z: number;
};

export type Velocity = {
  x: number;
  y: number;
  z: number;
};

export type Health = {
  current: number;
  max: number;
};
