"use client";

import { GameEndReason } from "@prisma/client";

import { usePlayer } from "@/hooks/use-player";
import { Game } from "@/utils/game-db";

import { useGame } from "../(hooks)/use-game";
import { useGameStore } from "../(stores)/game-store-provider";

export function GameFinished({
   initialGame,
}: Readonly<{
   initialGame: Game;
}>) {
   const { game } = useGame(initialGame);
   const winnerId = useGameStore((s) => s.winnerId);
   const { playerId } = usePlayer();
   return (
      <div>
         <div>
            {game.gameEndReason === GameEndReason.TIE && <h2>TIE!</h2>}
            {game.gameEndReason === GameEndReason.WIN && (
               <h2>{winnerId === playerId ? "You won!" : "You lost!"}</h2>
            )}
         </div>
      </div>
   );
}
