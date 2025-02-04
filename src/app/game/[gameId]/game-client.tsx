"use client";

import { GameState } from "@prisma/client";

import { Game as GameT } from "@/utils/game-db";
import { AllMovesByPlayerId } from "@/utils/move-db";

import { Game } from "./(components)/game";
import { ShipPlacement } from "./(components)/ship-placement";
import { useGame } from "./(hooks)/use-game";

export function GameClient({
   initialGame,
   initialMoves,
}: Readonly<{ initialGame: GameT; initialMoves: AllMovesByPlayerId }>) {
   const { game, error } = useGame(initialGame);

   if (error) {
      return <p>{error}</p>;
   }

   return (
      <>
         {game.state === GameState.SHIP_PLACEMENT && <ShipPlacement initialGame={game} />}
         {game.state === GameState.PLAYING && (
            <Game initialGame={game} initialMoves={initialMoves} />
         )}
      </>
   );
}
