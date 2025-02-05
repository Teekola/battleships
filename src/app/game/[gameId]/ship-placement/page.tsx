import { notFound } from "next/navigation";

import { db } from "@/utils/db";

import { ShipPlacement } from "./ship-placement";

export default async function ShipPlacementPage({
   params,
}: Readonly<{ params: Promise<{ gameId: string }> }>) {
   const gameId = (await params).gameId;
   const game = await db.game.getById(gameId);

   if (!game) notFound();

   const player1PlacedShips = game.player1Id
      ? await db.placedShip.getShips({ gameId, playerId: game.player1Id })
      : [];
   const player2PlacedShips = game.player2Id
      ? await db.placedShip.getShips({ gameId, playerId: game.player2Id })
      : [];

   return (
      <ShipPlacement
         initialGame={game}
         initialPlayer1PlacedShips={player1PlacedShips}
         initialPlayer2PlacedShips={player2PlacedShips}
      />
   );
}
