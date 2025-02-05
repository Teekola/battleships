import { GameEndReason, GameState } from "@prisma/client";

import { MoveDBT } from "@/utils/move-db";

import { updateGame } from "../actions";

export async function checkGameEnd({
   gameId,
   ownHitsRemaining,
   opponentHitsRemaining,
   opponentId,
   playerId,
   ownMoves,
   opponentMoves,
}: {
   gameId: string;
   ownHitsRemaining: number;
   opponentHitsRemaining: number;
   opponentId: string;
   playerId: string;
   ownMoves: MoveDBT[];
   opponentMoves: MoveDBT[];
}) {
   // Both have moved equal number of turns and both have 0 hits left, it is a tie
   if (
      opponentHitsRemaining < 1 &&
      ownHitsRemaining < 1 &&
      ownMoves.length === opponentMoves.length
   ) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.TIE,
         state: GameState.FINISHED,
      });
      return { gameEndReason: GameEndReason.TIE, winnerId: null, gameState: GameState.FINISHED };
   }

   // Both have moved equal number of turns and opponent has 0 hits left, opponent wins
   if (opponentHitsRemaining < 1 && ownMoves.length === opponentMoves.length) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.WIN,
         state: GameState.FINISHED,
      });
      return {
         gameEndReason: GameEndReason.WIN,
         winnerId: opponentId,
         gameState: GameState.FINISHED,
      };
   }

   // Both have moved equal number of turns and player has 0 hits left, player wins
   if (ownHitsRemaining < 1 && ownMoves.length === opponentMoves.length) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.WIN,
         state: GameState.FINISHED,
      });
      return {
         gameEndReason: GameEndReason.WIN,
         winnerId: playerId,
         gameState: GameState.FINISHED,
      };
   }

   // Opponent has more than 1 hit remaining and player has 0 so although player has moved more, player wins
   if (
      opponentHitsRemaining > 1 &&
      ownHitsRemaining < 1 &&
      ownMoves.length > opponentMoves.length
   ) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.WIN,
         state: GameState.FINISHED,
      });
      return {
         gameEndReason: GameEndReason.WIN,
         winnerId: playerId,
         gameState: GameState.FINISHED,
      };
   }

   // Player has more than 1 hit remaining and opponent has 0 so although player has moved less, opponent opponent wins
   if (
      ownHitsRemaining > 1 &&
      opponentHitsRemaining < 1 &&
      ownMoves.length < opponentMoves.length
   ) {
      await updateGame({
         gameId,
         gameEndReason: GameEndReason.WIN,
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
