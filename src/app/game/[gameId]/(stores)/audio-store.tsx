import { createStore } from "zustand/vanilla";

export type AudioStoreState = {
   volume: number;
};

export type AudioStoreActions = {
   toggleAudio: () => void;
};

export type AudioStore = AudioStoreState & AudioStoreActions;

export const defaultInitState: AudioStoreState = {
   volume: 1,
};

export function createAudioStore(initState: AudioStoreState = defaultInitState) {
   return createStore<AudioStore>((set) => ({
      ...initState,
      toggleAudio: () => set((state) => ({ ...state, volume: state.volume === 1 ? 0 : 1 })),
   }));
}
