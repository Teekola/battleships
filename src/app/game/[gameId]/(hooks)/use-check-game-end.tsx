"use client";

import { useEffect } from "react";

import { GameMode, GameState } from "@prisma/client";

import { usePlayer } from "@/hooks/use-player";
import { Game as GameT } from "@/utils/game-db";

import { useGameStore } from "../(stores)/game-store-provider";
import { checkGameEnd } from "../(utils)/check-game-end";

export function useCheckGameEnd(initialGame: Readonly<GameT>) {
   const game = useGameStore((s) => s.game) ?? initialGame;
   const ownHitsRemaining = useGameStore((s) => s.ownHitsRemaining);
   const opponentHitsRemaining = useGameStore((s) => s.opponentHitsRemaining);
   const { playerId, hasHydrated } = usePlayer();
   const isPlayer1 = game.player1Id === playerId;
   const opponentId = isPlayer1 ? game.player2Id! : game.player1Id!;

   const opponentTurnsPlayed =
      useGameStore((s) => s.opponentTurnsPlayed) ??
      (isPlayer1 ? game.player2PlayedTurns : game.player1PlayedTurns);

   const ownTurnsPlayed =
      useGameStore((s) => s.ownTurnsPlayed) ??
      (isPlayer1 ? game.player1PlayedTurns : game.player2PlayedTurns);

   const setGameEndReason = useGameStore((s) => s.setGameEndReason) ?? initialGame.gameEndReason;
   const setWinnerId = useGameStore((s) => s.setWinnerId) ?? initialGame.winnerId;

   const lastCheckedTurns = useGameStore((s) => s.lastCheckedTurns);
   const setLastCheckedTurns = useGameStore((s) => s.setLastCheckedTurns);

   useEffect(() => {
      if (!hasHydrated) return;

      console.log({ ownTurnsPlayed, opponentTurnsPlayed, lastCheckedTurns });
      // Only trigger win check if turn count has actually updated
      if (
         initialGame.gameMode === GameMode.RAMPAGE &&
         ownTurnsPlayed + opponentTurnsPlayed <= lastCheckedTurns &&
         (ownHitsRemaining! > 0 || opponentHitsRemaining! > 0)
      ) {
         return;
      }
      if (
         initialGame.gameMode === GameMode.CLASSIC &&
         ownTurnsPlayed + opponentTurnsPlayed <= lastCheckedTurns &&
         (ownHitsRemaining! > 0 || opponentHitsRemaining! > 0)
      ) {
         return;
      }

      (async () => {
         const { gameState, gameEndReason, winnerId } = await checkGameEnd({
            ownHitsRemaining: ownHitsRemaining ?? 2,
            opponentHitsRemaining: opponentHitsRemaining ?? 2,
            ownTurnsPlayed,
            opponentTurnsPlayed,
            gameId: initialGame.id,
            opponentId,
            playerId,
         });

         if (gameState === GameState.FINISHED) {
            setGameEndReason(gameEndReason);
            setWinnerId(winnerId);
         }
         setLastCheckedTurns(ownTurnsPlayed + opponentTurnsPlayed);
      })();
   }, [
      initialGame.gameMode,
      setLastCheckedTurns,
      lastCheckedTurns,
      hasHydrated,
      ownHitsRemaining,
      opponentHitsRemaining,
      initialGame.id,
      opponentId,
      playerId,
      setGameEndReason,
      setWinnerId,
      ownTurnsPlayed,
      opponentTurnsPlayed,
   ]);
}
