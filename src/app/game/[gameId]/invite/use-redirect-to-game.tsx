"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { Game } from "@/utils/db";

import { useGame } from "../(hooks)/use-game";

export function useRedirectToGame(initialGame: Readonly<Game>) {
   const { error, game } = useGame(initialGame);
   const router = useRouter();
   useEffect(() => {
      if (game.player1Name && game.player2Name) {
         router.push(`/game/${game.id}`);
      }
   }, [game, router]);

   return { error, game };
}
