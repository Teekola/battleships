import { notFound } from "next/navigation";

import { db } from "@/utils/db";

import { GameClient } from "./game-client";

export default async function GamePage({
   params,
}: Readonly<{ params: Promise<{ gameId: string }> }>) {
   const gameId = (await params).gameId;
   const game = await db.game.getById(gameId);

   if (!game) notFound();

   return (
      <>
         <GameClient initialGame={game} />
      </>
   );
}
