"use client";

import { Volume2Icon, VolumeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAudio } from "../(hooks)/use-audio";

export function MuteButton() {
   const { volume, toggleAudio } = useAudio();

   return (
      <Button size="icon" variant="ghost" onClick={toggleAudio}>
         {volume === 0 ? <VolumeOffIcon /> : <Volume2Icon />}
      </Button>
   );
}
