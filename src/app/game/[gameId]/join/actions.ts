"use server";

import { UpdateGameArgs, db } from "@/utils/db";

export async function updateGame(data: UpdateGameArgs) {
   const game = await db.game.update(data);
   return game;
}
