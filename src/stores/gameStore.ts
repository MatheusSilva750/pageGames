import { create } from 'zustand';

type GameSpeed = 1 | 2;

interface GameState {
  resources: number;
  speed: GameSpeed;
  selectedEntityId: number | null;
  addResources: (amount: number) => void;
  setSpeed: (speed: GameSpeed) => void;
  selectEntity: (id: number | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  resources: 100,
  speed: 1,
  selectedEntityId: null,
  addResources: (amount) => set((state) => ({ resources: state.resources + amount })),
  setSpeed: (speed) => set({ speed }),
  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
}));
