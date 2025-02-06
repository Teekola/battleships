import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { usePlayer } from "@/hooks/use-player";
import { Game } from "@/utils/game-db";

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

export function usePlayersReadyState(initialGame: Readonly<Game>) {
   const { game, error } = useGame(initialGame);
   const { playerId } = usePlayer();
   const isPlayer1 = playerId === game.player1Id;
   const initialIsReady = Boolean(isPlayer1 ? game.player1PlayAgain : game.player2PlayAgain);
   const initialIsOpponentReady = Boolean(
      isPlayer1 ? game.player2PlayAgain : game.player1PlayAgain
   );
   const router = useRouter();

   const [isPlayAgain, setIsPlayAgain] = useState(initialIsReady);
   const [isOpponentPlayAgain, setIsOpponentPlayAgain] = useState(initialIsOpponentReady);

   useEffect(() => {
      if (isPlayer1) {
         setIsOpponentPlayAgain(game.player2PlayAgain ?? false);
         return;
      }
      setIsOpponentPlayAgain(game.player1PlayAgain ?? false);
   }, [game, isPlayer1]);

   const updatePlayAgain = useCallback(
      async (isPlayAgainState: boolean) => {
         setIsPlayAgain((prev) => !prev);
         const shouldBePlayAgain = await updatePlayerPlayAgain({
            gameId: game.id,
            isPlayer1,
            isPlayAgain: isPlayAgainState,
         });

         setIsPlayAgain(shouldBePlayAgain);
      },
      [game.id, isPlayer1]
   );

   useEffect(() => {
      (async () => {
         if (isPlayAgain && isOpponentPlayAgain && game.player1Id && game.player2Id) {
            await restartGame({
               gameId: game.id,
               player1Id: game.player1Id,
               player2Id: game.player2Id,
            });
            router.push(`/game/${game.id}/ship-placement`);
         }
      })();
   }, [isPlayAgain, isOpponentPlayAgain, game.id, game.player1Id, game.player2Id, router]);

   return { error, isPlayAgain, isOpponentPlayAgain, updatePlayAgain };
}
