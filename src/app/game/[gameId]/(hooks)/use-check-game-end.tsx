"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { GameEndReason, GameState } from "@prisma/client";

import { usePlayer } from "@/hooks/use-player";

import { useGameStore } from "../(stores)/game-store-provider";
import { updateGame } from "../actions";

export function useCheckGameEnd() {
   const router = useRouter();
   const setGameEndReason = useGameStore((s) => s.setGameEndReason);
   const setWinnerId = useGameStore((s) => s.setWinnerId);
   const gameEndReason = useGameStore((s) => s.gameEndReason);
   const winnerId = useGameStore((s) => s.winnerId);
   const ownHitsRemaining = useGameStore((s) => s.ownHitsRemaining);
   const opponentHitsRemaining = useGameStore((s) => s.opponentHitsRemaining);
   const ownMoves = useGameStore((s) => s.ownMoves);
   const opponentMoves = useGameStore((s) => s.opponentMoves);
   const game = useGameStore((s) => s.game);
   const { playerId } = usePlayer();

   // Check for winning and update state
   useEffect(() => {
      if (
         ownHitsRemaining === undefined ||
         opponentHitsRemaining === undefined ||
         !game ||
         !playerId
      )
         return;

      const opponentId = playerId === game.player1Id ? game.player2Id : game.player1Id;

      if (!opponentId) return;

      (async () => {
         if (
            opponentHitsRemaining < 1 &&
            ownHitsRemaining < 1 &&
            ownMoves.length === opponentMoves.length
         ) {
            setGameEndReason(GameEndReason.TIE);
            await updateGame({
               gameId: game.id,
               gameEndReason: GameEndReason.TIE,
               state: GameState.FINISHED,
            });
            return;
         }

         if (opponentHitsRemaining < 1 && ownMoves.length === opponentMoves.length) {
            setGameEndReason(GameEndReason.WIN);
            setWinnerId(opponentId);
            await updateGame({
               gameId: game.id,
               gameEndReason: GameEndReason.WIN,
               state: GameState.FINISHED,
            });
            return;
         }

         if (ownHitsRemaining < 1 && ownMoves.length === opponentMoves.length) {
            setGameEndReason(GameEndReason.WIN);
            setWinnerId(playerId);
            await updateGame({
               gameId: game.id,
               gameEndReason: GameEndReason.WIN,
               state: GameState.FINISHED,
            });
            return;
         }
      })();
   }, [
      ownMoves,
      opponentMoves,
      setGameEndReason,
      setWinnerId,
      router,
      game,
      playerId,
      ownHitsRemaining,
      opponentHitsRemaining,
   ]);
   return { gameEndReason, winnerId };
}
