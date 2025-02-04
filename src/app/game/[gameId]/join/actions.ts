"use server";

import { UpdateGameArgs, db } from "@/utils/db";

export async function updateGame(data: UpdateGameArgs) {
   await db.game.update(data);
}
