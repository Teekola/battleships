"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { Game } from "@/utils/db";

import { useGame } from "../(hooks)/use-game";

export function WaitingForPlayer({ initialGame }: Readonly<{ initialGame: Game }>) {
   const { error, game } = useGame(initialGame);
   const router = useRouter();

   useEffect(() => {
      if (game.player1Name && game.player2Name) {
         router.push(`/game/${game.id}`);
      }
   }, [game, router]);

   if (error) {
      return <p className="text-sm text-red-500">{error}</p>;
   }

   return <p className="animate-pulse text-sm">Waiting for player...</p>;
}
