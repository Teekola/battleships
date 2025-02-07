"use client";

import { useEffect } from "react";

import { GameState } from "@prisma/client";

import { usePlayer } from "@/hooks/use-player";
import { Game as GameT } from "@/utils/game-db";

import { useGameStore } from "../(stores)/game-store-provider";
import { checkGameEnd } from "../(utils)/check-game-end";

export function useCheckGameEnd(initialGame: Readonly<GameT>) {
   const game = useGameStore((s) => s.game) ?? initialGame;
   const ownMoves = useGameStore((s) => s.ownMoves);
   const opponentMoves = useGameStore((s) => s.opponentMoves);
   const ownHitsRemaining = useGameStore((s) => s.ownHitsRemaining);
   const opponentHitsRemaining = useGameStore((s) => s.opponentHitsRemaining);
   const { playerId, hasHydrated } = usePlayer();
   const isPlayer1 = game.player1Id === playerId;
   const opponentId = isPlayer1 ? game.player2Id! : game.player1Id!;

   const setGameEndReason = useGameStore((s) => s.setGameEndReason) ?? initialGame.gameEndReason;
   const setWinnerId = useGameStore((s) => s.setWinnerId) ?? initialGame.winnerId;
   useEffect(() => {
      if (!hasHydrated) return;
      console.log({
         ownHitsRemaining,
         opponentHitsRemaining,
         playerId,
         opponentId,
         ownMoves,
         opponentMoves,
      });
      (async () => {
         const { gameState, gameEndReason, winnerId } = await checkGameEnd({
            ownHitsRemaining: ownHitsRemaining ?? 2,
            opponentHitsRemaining: opponentHitsRemaining ?? 2,
            gameId: game.id,
            opponentId,
            playerId,
            ownMoves,
            opponentMoves,
         });

         if (gameState === GameState.FINISHED) {
            setGameEndReason(gameEndReason);
            setWinnerId(winnerId);
         }
      })();
   }, [
      hasHydrated,
      ownHitsRemaining,
      opponentHitsRemaining,
      game.id,
      opponentId,
      playerId,
      ownMoves,
      opponentMoves,
      setGameEndReason,
      setWinnerId,
   ]);
}
