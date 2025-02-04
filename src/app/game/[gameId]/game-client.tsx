"use client";

import { GameState } from "@prisma/client";

import { Game as GameT } from "@/utils/game-db";
import { AllMovesByPlayerId } from "@/utils/move-db";
import { PlacedShipDBT } from "@/utils/placed-ship-db";

import { Game } from "./(components)/game";
import { ShipPlacement } from "./(components)/ship-placement";
import { useGame } from "./(hooks)/use-game";

export function GameClient({
   initialGame,
   initialMoves,
   player1PlacedShips,
   player2PlacedShips,
}: Readonly<{
   initialGame: GameT;
   initialMoves: AllMovesByPlayerId;
   player1PlacedShips: PlacedShipDBT[];
   player2PlacedShips: PlacedShipDBT[];
}>) {
   const { game, error } = useGame(initialGame);

   if (error) {
      return <p>{error}</p>;
   }

   return (
      <>
         {game.state === GameState.SHIP_PLACEMENT && (
            <ShipPlacement
               initialGame={game}
               initialPlayer1PlacedShips={player1PlacedShips}
               initialPlayer2PlacedShips={player2PlacedShips}
            />
         )}
         {game.state === GameState.PLAYING && (
            <Game
               initialGame={game}
               initialMoves={initialMoves}
               initialPlayer1PlacedShips={player1PlacedShips}
               initialPlayer2PlacedShips={player2PlacedShips}
            />
         )}
      </>
   );
}
