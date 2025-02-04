"use client";

import { GameState } from "@prisma/client";

import { Game as GameT } from "@/utils/db";

import { Game } from "./(components)/game";
import { ShipPlacement } from "./(components)/ship-placement";
import { useGame } from "./(hooks)/use-game";

export function GameClient({ initialGame }: Readonly<{ initialGame: GameT }>) {
   const { game, error } = useGame(initialGame);

   if (error) {
      return <p>{error}</p>;
   }

   return (
      <>
         {game.state === GameState.SHIP_PLACEMENT && <ShipPlacement initialGame={game} />}
         {game.state === GameState.PLAYING && <Game />}
      </>
   );
}
