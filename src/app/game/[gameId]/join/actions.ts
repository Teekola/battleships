"use server";

import { UpdatePlayerArgs, db } from "@/utils/db";

export async function updatePlayer(data: UpdatePlayerArgs) {
   await db.game.updatePlayer(data);
}
