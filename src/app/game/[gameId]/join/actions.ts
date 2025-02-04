"use server";

import { db } from "@/utils/db";
import { UpdateGameArgs } from "@/utils/game-db";

export async function updateGame(data: UpdateGameArgs) {
   const game = await db.game.update(data);
   return game;
}
