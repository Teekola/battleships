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
   console.log("CHECK GAME END");
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

   return { gameEndReason: null, winnerId: null, gameState: GameState.PLAYING };
}
