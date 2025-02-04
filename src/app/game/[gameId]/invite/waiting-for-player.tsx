"use client";

import { Game } from "@/utils/db";

import { useRedirectToGame } from "./use-redirect-to-game";

export function WaitingForPlayer({ initialGame }: Readonly<{ initialGame: Game }>) {
   const { error } = useRedirectToGame(initialGame);

   if (error) {
      return <p className="text-sm text-red-500">{error}</p>;
   }

   return <p className="animate-pulse text-sm">Waiting for player...</p>;
}
