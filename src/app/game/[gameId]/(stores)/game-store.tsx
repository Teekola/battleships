import { createStore } from "zustand/vanilla";

import { Game } from "@/utils/db";

export type GameStoreState = {
   game: Game | null;
};

export type GameStoreActions = {
   setGame: (g: Game) => void;
};

export type GameStore = GameStoreState & GameStoreActions;

export const defaultInitState: GameStoreState = { game: null };

export function createGameStore(initState: GameStoreState = defaultInitState) {
   return createStore<GameStore>((set) => ({
      ...initState,
      setGame: (g) => set((state) => ({ ...state, game: g })),
   }));
}
