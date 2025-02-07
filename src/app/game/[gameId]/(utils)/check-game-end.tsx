import { GameEndReason, GameState } from "@prisma/client";

import { updateGame } from "../actions";

export async function checkGameEnd({
   gameId,
   ownHitsRemaining,
   opponentHitsRemaining,
   ownTurnsPlayed,
   opponentTurnsPlayed,
   opponentId,
   playerId,
}: {
   gameId: string;
   ownHitsRemaining: number; // How many hits the player needs to win
   opponentHitsRemaining: number; // How many hits the opponent needs to win
   ownTurnsPlayed: number;
   opponentTurnsPlayed: number;
   opponentId: string;
   playerId: string;
}) {
   if (ownHitsRemaining > 0 && opponentHitsRemaining > 0) {
      return { gameEndReason: null, winnerId: null, gameState: GameState.PLAYING };
   }

   const bothHadEqualTurns = ownTurnsPlayed === opponentTurnsPlayed;

   // In both Classic and Rampage mode, when both have sunk all ships and played equal number eof turns, it is a TIE
   if (ownHitsRemaining === 0 && opponentHitsRemaining === 0 && bothHadEqualTurns) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.TIE,
         state: GameState.FINISHED,
      });
      return {
         gameEndReason: GameEndReason.TIE,
         winnerId: null,
         gameState: GameState.FINISHED,
      };
   }

   // In both modes when own hits required is 0, opponent has hits remaining, and opponent has played equal amount of turns, we have a win
   if (ownHitsRemaining === 0 && opponentHitsRemaining > 0 && bothHadEqualTurns) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.WIN,
         winnerId: playerId,
         state: GameState.FINISHED,
      });
      return {
         gameEndReason: GameEndReason.WIN,
         winnerId: playerId,
         gameState: GameState.FINISHED,
      };
   }

   // In both modes when opponent hits required is 0, player has hits remaining, and player has played equal amount of turns, we have a win
   if (opponentHitsRemaining === 0 && ownHitsRemaining > 0 && bothHadEqualTurns) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.WIN,
         winnerId: opponentId,
         state: GameState.FINISHED,
      });
      return {
         gameEndReason: GameEndReason.WIN,
         winnerId: opponentId,
         gameState: GameState.FINISHED,
      };
   }

   return { gameEndReason: null, winnerId: null, gameState: GameState.PLAYING };
}
