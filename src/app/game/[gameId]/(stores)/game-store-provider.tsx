"use client";

import { type ReactNode, createContext, useContext, useRef } from "react";

import { useStore } from "zustand";

import { type GameStore, createGameStore } from "./game-store";

export type GameStoreApi = ReturnType<typeof createGameStore>;

export const GameStoreContext = createContext<GameStoreApi | undefined>(undefined);

export interface GameStoreProviderProps {
   children: ReactNode;
}

export function GameStoreProvider({ children }: GameStoreProviderProps) {
   const storeRef = useRef<GameStoreApi>(undefined);
   if (!storeRef.current) {
      storeRef.current = createGameStore();
   }

   return (
      <GameStoreContext.Provider value={storeRef.current}>{children}</GameStoreContext.Provider>
   );
}

export function useGameStore<T>(selector: (store: GameStore) => T): T {
   const gameStoreContext = useContext(GameStoreContext);

   if (!gameStoreContext) {
      throw new Error("useGameStore must be used within GameStoreProvider");
   }

   return useStore(gameStoreContext, selector);
}

export function useGame() {
   return useGameStore((s) => s.game);
}
