import { notFound } from "next/navigation";

import { db } from "@/utils/db";

import { GameClient } from "./game-client";

export default async function GamePage({
   params,
}: Readonly<{ params: Promise<{ gameId: string }> }>) {
   const gameId = (await params).gameId;
   const game = await db.game.getById(gameId);

   if (!game) notFound();

   const moves = await db.move.getAll({ gameId });
   const player1PlacedShips = game.player1Id
      ? await db.placedShip.getShips({ gameId, playerId: game.player1Id })
      : [];
   const player2PlacedShips = game.player2Id
      ? await db.placedShip.getShips({ gameId, playerId: game.player2Id })
      : [];

   return (
      <GameClient
         initialGame={game}
         initialMoves={moves}
         player1PlacedShips={player1PlacedShips}
         player2PlacedShips={player2PlacedShips}
      />
   );
}
