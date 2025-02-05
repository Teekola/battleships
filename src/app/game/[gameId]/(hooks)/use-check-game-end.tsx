"use client";

import { useEffect } from "react";

import { GameState } from "@prisma/client";

import { usePlayer } from "@/hooks/use-player";
import { Game as GameT } from "@/utils/game-db";

import { useGame } from "../(hooks)/use-game";
import { useGameStore } from "../(stores)/game-store-provider";
import { checkGameEnd } from "../(utils)/check-game-end";

export function useCheckGameEnd(initialGame: Readonly<GameT>) {
   const { game } = useGame(initialGame);
   const ownMoves = useGameStore((s) => s.ownMoves);
   const opponentMoves = useGameStore((s) => s.opponentMoves);
   const ownHitsRemaining = useGameStore((s) => s.ownHitsRemaining);
   const opponentHitsRemaining = useGameStore((s) => s.opponentHitsRemaining);
   const { playerId, hasHydrated } = usePlayer();
   const isPlayer1 = game.player1Id === playerId;
   const opponentId = isPlayer1 ? game.player2Id! : game.player1Id!;

   const setGameEndReason = useGameStore((s) => s.setGameEndReason);
   const setWinnerId = useGameStore((s) => s.setWinnerId);
   useEffect(() => {
      if (!hasHydrated) return;
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
            if (winnerId) setWinnerId(winnerId);
            return;
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
