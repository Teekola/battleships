"use client";

import { useSound } from "use-sound";

import { useAudioStore } from "../(stores)/audio-store-provider";

const hitShipSound = "/hit-ship.mp3";
const hitWaterSound = "/hit-water.mp3";

export function useAudio() {
   const volume = useAudioStore((s) => s.volume);
   const toggleAudio = useAudioStore((s) => s.toggleAudio);

   const [playShipHitSound] = useSound(hitShipSound, {
      volume: volume * 0.5,
   });

   const [playWaterHitSound] = useSound(hitWaterSound, {
      volume: volume * 0.1,
   });

   return { playShipHitSound, playWaterHitSound, volume, toggleAudio };
}
