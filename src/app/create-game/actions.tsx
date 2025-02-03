"use server";

import { CreateGameArgs, db } from "@/utils/db";

export async function createGame(createGameArgs: CreateGameArgs) {
   const gameId = await db.game.create(createGameArgs);
   return gameId;
}
