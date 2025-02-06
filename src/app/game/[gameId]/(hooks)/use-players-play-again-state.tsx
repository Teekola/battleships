import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { usePlayer } from "@/hooks/use-player";
import { Game } from "@/utils/game-db";

import { useGameStore } from "../(stores)/game-store-provider";
import { restartGame, updateGame } from "../actions";
import { useGame } from "./use-game";

async function updatePlayerPlayAgain({
   gameId,
   isPlayer1,
   isPlayAgain,
}: {
   gameId: string;
   isPlayer1: boolean;
   isPlayAgain: boolean;
}) {
   const result = await updateGame({ gameId, isPlayer1, playAgain: isPlayAgain });
   return Boolean(isPlayer1 ? result.player1PlayAgain : result.player2PlayAgain);
}

export function usePlayersPlayAgainState(initialGame: Readonly<Game>) {
   const { game, error } = useGame(initialGame);
   const { playerId, hasHydrated } = usePlayer();
   const winnerId = useGameStore((s) => s.winnerId) ?? initialGame.winnerId;
   const isPlayer1 = playerId === game.player1Id;
   const initialIsPlayAgain = Boolean(isPlayer1 ? game.player1PlayAgain : game.player2PlayAgain);
   const initialIsOpponentPlayAgain = Boolean(
      isPlayer1 ? game.player2PlayAgain : game.player1PlayAgain
   );
   const resetStore = useGameStore((s) => s.reset);
   const router = useRouter();
   const winnerName = winnerId === game.player1Id ? game.player1Name : game.player2Name;
   const opponentName = playerId === game.player1Id ? game.player2Name : game.player1Name;

   const [isPlayAgain, setIsPlayAgain] = useState(initialIsPlayAgain);
   const [isOpponentPlayAgain, setIsOpponentPlayAgain] = useState(initialIsOpponentPlayAgain);

   useEffect(() => {
      if (!hasHydrated) return;

      if (isPlayer1) {
         setIsOpponentPlayAgain(game.player2PlayAgain ?? false);
         return;
      }
      setIsOpponentPlayAgain(game.player1PlayAgain ?? false);
   }, [game, isPlayer1, hasHydrated]);

   const updatePlayAgain = useCallback(
      async (isPlayAgainState: boolean) => {
         setIsPlayAgain((prev) => !prev);
         await updatePlayerPlayAgain({
            gameId: game.id,
            isPlayer1,
            isPlayAgain: isPlayAgainState,
         });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [game.id, isPlayer1, isPlayAgain]
   );

   useEffect(() => {
      if (!hasHydrated) return;
      (async () => {
         if (isPlayAgain && isOpponentPlayAgain && game.player1Id && game.player2Id) {
            resetStore();
            await restartGame({
               gameId: game.id,
            });
            router.push(`/game/${game.id}/ship-placement`);
         }
      })();
   }, [
      hasHydrated,
      isPlayAgain,
      isOpponentPlayAgain,
      game.id,
      game.player1Id,
      game.player2Id,
      router,
      resetStore,
   ]);

   return { error, winnerName, opponentName, isPlayAgain, isOpponentPlayAgain, updatePlayAgain };
}
