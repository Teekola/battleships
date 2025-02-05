"use server";

import { db } from "@/utils/db";
import { CreateGameArgs } from "@/utils/game-db";

export async function createGame(createGameArgs: CreateGameArgs) {
   const gameId = await db.game.create(createGameArgs);
   return gameId;
}
