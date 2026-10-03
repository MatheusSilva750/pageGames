export interface GridPoint {
  x: number;
  y: number;
}

export function manhattanDistance(a: GridPoint, b: GridPoint) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
