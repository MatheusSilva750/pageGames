export type Vec3 = [number, number, number];

export type UnitType = 'worker' | 'guard';
export type UnitState = 'idle' | 'moving' | 'gathering' | 'returning' | 'attacking';
export type BuildingType = 'hive' | 'nursery' | 'tower' | 'depot';

export interface BeeUnit {
  id: number;
  type: UnitType;
  position: Vec3;
  target: Vec3 | null;
  state: UnitState;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  cargo: number;
  targetResourceId: number | null;
  targetEnemyId: number | null;
}

export interface Building {
  id: number;
  type: BuildingType;
  position: Vec3;
  health: number;
  maxHealth: number;
}

export interface ResourceNode {
  id: number;
  position: Vec3;
  amount: number;
}

export interface EnemyUnit {
  id: number;
  position: Vec3;
  target: Vec3 | null;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  attackCooldown: number;
}
