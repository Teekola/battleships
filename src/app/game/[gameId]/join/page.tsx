import { notFound } from "next/navigation";

import { db } from "@/utils/db";

import { PlayerNameForm } from "./player-name-form";

export default async function GameJoinPage({
   params,
}: Readonly<{ params: Promise<{ gameId: string }> }>) {
   const gameId = (await params).gameId;
   const game = await db.game.getById(gameId);

   if (!game) notFound();

   return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
         <h1 className="text-2xl font-bold">What is your name?</h1>
         <PlayerNameForm gameId={gameId} initialGame={game} />
      </div>
   );
}
