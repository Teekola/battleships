import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { usePlayer } from "@/hooks/use-player";
import { Game } from "@/utils/game-db";

import { useGameStore } from "../(stores)/game-store-provider";
import { startGame } from "../actions";
import { updateGame } from "../actions";

async function updatePlayerReady({
   gameId,
   isPlayer1,
   isReady,
}: {
   gameId: string;
   isPlayer1: boolean;
   isReady: boolean;
}) {
   const result = await updateGame({ gameId, isPlayer1, playerReady: isReady });
   return Boolean(isPlayer1 ? result.player1Ready : result.player2Ready);
}

export function usePlayersReadyState(initialGame: Readonly<Game>) {
   const game = useGameStore((s) => s.game) ?? initialGame;
   const { playerId } = usePlayer();
   const isPlayer1 = playerId === game.player1Id;
   const initialIsReady = Boolean(isPlayer1 ? game.player1Ready : game.player2Ready);
   const initialIsOpponentReady = Boolean(isPlayer1 ? game.player2Ready : game.player1Ready);
   const winnerId = useGameStore((s) => s.winnerId) ?? initialGame.winnerId;
   const router = useRouter();

   const [isReady, setIsReady] = useState(initialIsReady);
   const [isOpponentReady, setIsOpponentReady] = useState(initialIsOpponentReady);

   useEffect(() => {
      if (isPlayer1) {
         setIsOpponentReady(game.player2Ready ?? false);
         return;
      }
      setIsOpponentReady(game.player1Ready ?? false);
   }, [game, isPlayer1]);

   const updateIsReady = useCallback(
      async (isReadyState: boolean) => {
         setIsReady((prev) => !prev);
         const shouldBeReady = await updatePlayerReady({
            gameId: game.id,
            isPlayer1,
            isReady: isReadyState,
         });

         setIsReady(shouldBeReady);
      },
      [game.id, isPlayer1]
   );

   useEffect(() => {
      (async () => {
         if (isReady && isOpponentReady && game.player1Id && game.player2Id) {
            await startGame({ gameId: game.id, playerIds: [game.player1Id, game.player2Id] });
            router.push(`/game/${game.id}`);
         }
      })();
   }, [isReady, isOpponentReady, game.id, game.player1Id, game.player2Id, router]);

   return { winnerId, isReady, isOpponentReady, updateIsReady };
}
