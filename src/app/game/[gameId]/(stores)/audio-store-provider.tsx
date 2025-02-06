"use client";

import { type ReactNode, createContext, useContext, useRef } from "react";

import { useStore } from "zustand";

import { type AudioStore, createAudioStore } from "./audio-store";

export type AudioStoreApi = ReturnType<typeof createAudioStore>;

export const AudioStoreContext = createContext<AudioStoreApi | undefined>(undefined);

export interface GameStoreProviderProps {
   children: ReactNode;
}

export function AudioStoreProvider({ children }: GameStoreProviderProps) {
   const storeRef = useRef<AudioStoreApi>(undefined);
   if (!storeRef.current) {
      storeRef.current = createAudioStore();
   }

   return (
      <AudioStoreContext.Provider value={storeRef.current}>{children}</AudioStoreContext.Provider>
   );
}

export function useAudioStore<T>(selector: (store: AudioStore) => T): T {
   const audioStoreContext = useContext(AudioStoreContext);

   if (!audioStoreContext) {
      throw new Error("useAudioStore must be used within AudioStoreProvider");
   }

   return useStore(audioStoreContext, selector);
}
