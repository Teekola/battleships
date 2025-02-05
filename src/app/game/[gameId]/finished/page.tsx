import { notFound } from "next/navigation";

import { db } from "@/utils/db";

import { GameFinished } from "./game-finished";

export async function ShipPlacementPage({
   params,
}: Readonly<{ params: Promise<{ gameId: string }> }>) {
   const gameId = (await params).gameId;
   const game = await db.game.getById(gameId);

   if (!game) notFound();

   return <GameFinished initialGame={game} />;
}
