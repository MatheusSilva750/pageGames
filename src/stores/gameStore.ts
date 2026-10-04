import { create } from 'zustand';
import type { BeeUnit, Building, BuildingType, EnemyUnit, ResourceNode, UnitType, Vec3 } from '../game/types';

type GameSpeed = 1 | 2;

interface Resources {
  nectar: number;
  pollen: number;
}

interface GameState {
  resources: Resources;
  speed: GameSpeed;
  populationCap: number;
  units: BeeUnit[];
  buildings: Building[];
  resourceNodes: ResourceNode[];
  enemies: EnemyUnit[];
  selectedUnitIds: number[];
  buildMode: BuildingType | null;
  elapsed: number;
  waveTimer: number;
  message: string;
  setSpeed: (speed: GameSpeed) => void;
  selectUnit: (id: number, additive?: boolean) => void;
  clearSelection: () => void;
  setBuildMode: (type: BuildingType | null) => void;
  commandMove: (target: Vec3) => void;
  commandGather: (resourceId: number) => void;
  commandAttack: (enemyId: number) => void;
  placeBuilding: (type: BuildingType, position: Vec3) => void;
  produceUnit: (type: UnitType) => void;
  simulate: (delta: number) => void;
  resetGame: () => void;
}

const unitCosts: Record<UnitType, number> = {
  worker: 50,
  guard: 100,
};

const buildingCosts: Record<Exclude<BuildingType, 'hive'>, number> = {
  nursery: 150,
  tower: 125,
  depot: 100,
};

const initialUnits = (): BeeUnit[] => [
  ...Array.from({ length: 6 }, (_, index): BeeUnit => ({
    id: index + 1,
    type: 'worker',
    position: [-2 + (index % 3) * 1.2, 0.35, -1 + Math.floor(index / 3) * 1.1],
    target: null,
    state: 'idle',
    health: 60,
    maxHealth: 60,
    speed: 3.2,
    damage: 4,
    cargo: 0,
    targetResourceId: null,
    targetEnemyId: null,
  })),
  {
    id: 20,
    type: 'guard',
    position: [2.2, 0.4, 1.4],
    target: null,
    state: 'idle',
    health: 120,
    maxHealth: 120,
    speed: 2.7,
    damage: 18,
    cargo: 0,
    targetResourceId: null,
    targetEnemyId: null,
  },
];

const initialBuildings = (): Building[] => [
  { id: 1, type: 'hive', position: [0, 0, 0], health: 1500, maxHealth: 1500 },
  { id: 2, type: 'nursery', position: [4.5, 0, 2.5], health: 700, maxHealth: 700 },
];

const initialResources = (): ResourceNode[] => [
  { id: 1, position: [-8, 0.25, -4], amount: 700 },
  { id: 2, position: [-9, 0.25, 3], amount: 700 },
  { id: 3, position: [7, 0.25, 6], amount: 700 },
];

const distance = (a: Vec3, b: Vec3) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const moveTowards = (from: Vec3, to: Vec3, maxDistance: number): Vec3 => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);

  if (length <= maxDistance || length === 0) return [...to] as Vec3;

  const scale = maxDistance / length;
  return [from[0] + dx * scale, from[1] + dy * scale, from[2] + dz * scale];
};

const closestHive = (buildings: Building[], position: Vec3) =>
  buildings
    .filter((building) => building.type === 'hive' || building.type === 'depot')
    .sort((a, b) => distance(a.position, position) - distance(b.position, position))[0];

const createInitialState = () => ({
  resources: { nectar: 250, pollen: 100 },
  speed: 1 as GameSpeed,
  populationCap: 24,
  units: initialUnits(),
  buildings: initialBuildings(),
  resourceNodes: initialResources(),
  enemies: [] as EnemyUnit[],
  selectedUnitIds: [] as number[],
  buildMode: null as BuildingType | null,
  elapsed: 0,
  waveTimer: 12,
  message: 'Selecione uma abelha e dê ordens no campo.',
});

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialState(),

  setSpeed: (speed) => set({ speed }),

  selectUnit: (id, additive = false) =>
    set((state) => ({
      selectedUnitIds: additive
        ? state.selectedUnitIds.includes(id)
          ? state.selectedUnitIds.filter((unitId) => unitId !== id)
          : [...state.selectedUnitIds, id]
        : [id],
      buildMode: null,
    })),

  clearSelection: () => set({ selectedUnitIds: [] }),

  setBuildMode: (buildMode) => set({ buildMode }),

  commandMove: (target) =>
    set((state) => ({
      units: state.units.map((unit) =>
        state.selectedUnitIds.includes(unit.id)
          ? {
              ...unit,
              target,
              state: 'moving' as const,
              targetResourceId: null,
              targetEnemyId: null,
            }
          : unit,
      ),
      buildMode: null,
      message: state.selectedUnitIds.length ? 'Movendo enxame.' : 'Selecione unidades primeiro.',
    })),

  commandGather: (resourceId) =>
    set((state) => {
      const node = state.resourceNodes.find((resource) => resource.id === resourceId);
      if (!node) return state;

      const selectedWorkers = state.units.filter(
        (unit) => state.selectedUnitIds.includes(unit.id) && unit.type === 'worker',
      );

      if (!selectedWorkers.length) {
        return { ...state, message: 'Selecione pelo menos uma operária para coletar néctar.' };
      }

      return {
        ...state,
        units: state.units.map((unit) =>
          selectedWorkers.some((worker) => worker.id === unit.id)
            ? {
                ...unit,
                target: node.position,
                state: 'moving' as const,
                targetResourceId: resourceId,
                targetEnemyId: null,
              }
            : unit,
        ),
        message: 'Operárias enviadas para coleta.',
      };
    }),

  commandAttack: (enemyId) =>
    set((state) => {
      const enemy = state.enemies.find((candidate) => candidate.id === enemyId);
      if (!enemy || !state.selectedUnitIds.length) return state;

      return {
        ...state,
        units: state.units.map((unit) =>
          state.selectedUnitIds.includes(unit.id)
            ? {
                ...unit,
                target: enemy.position,
                state: 'attacking' as const,
                targetEnemyId: enemyId,
                targetResourceId: null,
              }
            : unit,
        ),
        message: 'Alvo hostil marcado.',
      };
    }),

  placeBuilding: (type, position) =>
    set((state) => {
      if (type === 'hive') return state;
      const cost = buildingCosts[type];
      if (state.resources.nectar < cost) {
        return { ...state, message: 'Néctar insuficiente para construir.' };
      }

      const nextId = Math.max(0, ...state.buildings.map((building) => building.id)) + 1;
      const healthByType: Record<Exclude<BuildingType, 'hive'>, number> = {
        nursery: 700,
        tower: 500,
        depot: 600,
      };

      return {
        ...state,
        resources: { ...state.resources, nectar: state.resources.nectar - cost },
        buildings: [
          ...state.buildings,
          {
            id: nextId,
            type,
            position,
            health: healthByType[type],
            maxHealth: healthByType[type],
          },
        ],
        populationCap: type === 'depot' ? state.populationCap + 8 : state.populationCap,
        buildMode: null,
        message: 'Estrutura construída.',
      };
    }),

  produceUnit: (type) =>
    set((state) => {
      const cost = unitCosts[type];
      if (state.resources.nectar < cost) {
        return { ...state, message: 'Néctar insuficiente para produzir a unidade.' };
      }
      if (state.units.length >= state.populationCap) {
        return { ...state, message: 'Limite populacional atingido. Construa um depósito.' };
      }
      if (!state.buildings.some((building) => building.type === 'nursery')) {
        return { ...state, message: 'Você precisa de um berçário.' };
      }

      const nextId = Math.max(20, ...state.units.map((unit) => unit.id)) + 1;
      const nursery = state.buildings.find((building) => building.type === 'nursery')!;
      const isWorker = type === 'worker';

      return {
        ...state,
        resources: { ...state.resources, nectar: state.resources.nectar - cost },
        units: [
          ...state.units,
          {
            id: nextId,
            type,
            position: [nursery.position[0] + 1, 0.35, nursery.position[2]] as Vec3,
            target: null,
            state: 'idle' as const,
            health: isWorker ? 60 : 120,
            maxHealth: isWorker ? 60 : 120,
            speed: isWorker ? 3.2 : 2.7,
            damage: isWorker ? 4 : 18,
            cargo: 0,
            targetResourceId: null,
            targetEnemyId: null,
          },
        ],
        message: type === 'worker' ? 'Nova operária nasceu.' : 'Nova guardiã pronta.',
      };
    }),

  simulate: (rawDelta) =>
    set((state) => {
      const delta = Math.min(rawDelta, 0.05) * state.speed;
      const elapsed = state.elapsed + delta;
      let waveTimer = state.waveTimer - delta;
      let resources = { ...state.resources };
      let resourceNodes = state.resourceNodes.map((node) => ({ ...node }));
      let enemies = state.enemies.map((enemy) => ({ ...enemy }));
      let buildings = state.buildings.map((building) => ({ ...building }));

      if (waveTimer <= 0) {
        const nextEnemyId = Math.max(1000, ...enemies.map((enemy) => enemy.id)) + 1;
        const amount = 2 + Math.min(4, Math.floor(elapsed / 45));
        enemies.push(
          ...Array.from({ length: amount }, (_, index): EnemyUnit => ({
            id: nextEnemyId + index,
            position: [12 + index * 0.7, 0.45, -7 + index * 1.2],
            target: [0, 0.45, 0],
            health: 90,
            maxHealth: 90,
            speed: 1.45,
            damage: 8,
            attackCooldown: 0,
          })),
        );
        waveTimer = 24;
      }

      let units = state.units.map((unit) => ({ ...unit }));

      units = units.map((unit) => {
        if (unit.state === 'moving' && unit.target) {
          const nextPosition = moveTowards(unit.position, unit.target, unit.speed * delta);
          const reached = distance(nextPosition, unit.target) < 0.15;

          if (reached && unit.targetResourceId) {
            return { ...unit, position: nextPosition, state: 'gathering' as const, target: null };
          }

          return {
            ...unit,
            position: nextPosition,
            state: reached ? ('idle' as const) : unit.state,
            target: reached ? null : unit.target,
          };
        }

        if (unit.state === 'gathering' && unit.targetResourceId) {
          const node = resourceNodes.find((resource) => resource.id === unit.targetResourceId);
          if (!node || node.amount <= 0) {
            return { ...unit, state: 'idle' as const, targetResourceId: null };
          }

          const gathered = Math.min(node.amount, 5 * delta, 12 - unit.cargo);
          node.amount -= gathered;
          const cargo = unit.cargo + gathered;

          if (cargo >= 12 || node.amount <= 0) {
            const hive = closestHive(buildings, unit.position);
            return hive
              ? {
                  ...unit,
                  cargo,
                  state: 'returning' as const,
                  target: [hive.position[0], 0.35, hive.position[2]] as Vec3,
                }
              : { ...unit, cargo };
          }

          return { ...unit, cargo };
        }

        if (unit.state === 'returning' && unit.target) {
          const nextPosition = moveTowards(unit.position, unit.target, unit.speed * delta);
          if (distance(nextPosition, unit.target) < 0.25) {
            resources.nectar += Math.round(unit.cargo);
            const node = unit.targetResourceId
              ? resourceNodes.find((resource) => resource.id === unit.targetResourceId)
              : null;
            return {
              ...unit,
              position: nextPosition,
              cargo: 0,
              state: node && node.amount > 0 ? ('moving' as const) : ('idle' as const),
              target: node && node.amount > 0 ? node.position : null,
            };
          }
          return { ...unit, position: nextPosition };
        }

        if (unit.state === 'attacking' && unit.targetEnemyId) {
          const enemy = enemies.find((candidate) => candidate.id === unit.targetEnemyId);
          if (!enemy || enemy.health <= 0) {
            return { ...unit, state: 'idle' as const, targetEnemyId: null, target: null };
          }

          const enemyPosition: Vec3 = enemy.position;
          const range = unit.type === 'guard' ? 1.7 : 1.1;

          if (distance(unit.position, enemyPosition) > range) {
            return {
              ...unit,
              position: moveTowards(unit.position, enemyPosition, unit.speed * delta),
              target: enemyPosition,
            };
          }

          enemy.health -= unit.damage * delta * 1.8;
          return { ...unit, target: enemyPosition };
        }

        return unit;
      });

      enemies = enemies
        .map((enemy) => {
          if (enemy.health <= 0) return enemy;

          const targetBuilding = buildings
            .slice()
            .sort((a, b) => distance(a.position, enemy.position) - distance(b.position, enemy.position))[0];

          if (!targetBuilding) return enemy;

          const target: Vec3 = [targetBuilding.position[0], 0.45, targetBuilding.position[2]];
          const range = targetBuilding.type === 'hive' ? 1.9 : 1.3;
          let attackCooldown = Math.max(0, enemy.attackCooldown - delta);

          if (distance(enemy.position, target) > range) {
            return {
              ...enemy,
              target,
              position: moveTowards(enemy.position, target, enemy.speed * delta),
              attackCooldown,
            };
          }

          if (attackCooldown <= 0) {
            targetBuilding.health -= enemy.damage;
            attackCooldown = 1.2;
          }

          return { ...enemy, target, attackCooldown };
        })
        .filter((enemy) => enemy.health > 0);

      buildings
        .filter((building) => building.type === 'tower' && building.health > 0)
        .forEach((tower) => {
          const target = enemies
            .filter((enemy) => distance(enemy.position, tower.position) <= 5.5)
            .sort((a, b) => distance(a.position, tower.position) - distance(b.position, tower.position))[0];

          if (target) target.health -= 22 * delta;
        });

      enemies = enemies.filter((enemy) => enemy.health > 0);
      buildings = buildings.filter((building) => building.health > 0);

      return {
        ...state,
        elapsed,
        waveTimer,
        units,
        enemies,
        buildings,
        resourceNodes,
        resources,
      };
    }),

  resetGame: () => set(createInitialState()),
}));
