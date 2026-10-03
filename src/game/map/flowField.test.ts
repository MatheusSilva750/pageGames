import { describe, expect, it } from 'vitest';
import { manhattanDistance } from './flowField';

describe('manhattanDistance', () => {
  it('calcula a distância em uma grade ortogonal', () => {
    expect(manhattanDistance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(7);
  });
});
