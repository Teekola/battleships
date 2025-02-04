"use server";

import { db } from "@/utils/db";
import { PlaceShipsArgs } from "@/utils/placed-ship-db";

export async function placeShips(data: PlaceShipsArgs) {
   await db.placedShip.placeShips(data);
}

export async function startGame(data: { gameId: string; playerIds: string[] }) {
   await db.game.startGame(data);
}
