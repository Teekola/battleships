"use client";

import { useState } from "react";

import { useSound } from "use-sound";

const hitShipSound = "/hit-ship.mp3";
const hitWaterSound = "/hit-water.mp3";

export function useAudio() {
   const [volume, setVolume] = useState(1);

   const [playShipHitSound] = useSound(hitShipSound, {
      volume: volume * 0.5,
   });

   const [playWaterHitSound] = useSound(hitWaterSound, {
      volume: volume * 0.1,
   });

   return { playShipHitSound, playWaterHitSound, volume, setVolume };
}
