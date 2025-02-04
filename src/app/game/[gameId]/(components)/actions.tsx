"use server";

import { db } from "@/utils/db";
import { CreateMoveArgs } from "@/utils/move-db";
import { GetShipsArgs, PlaceShipsArgs } from "@/utils/placed-ship-db";

export async function placeShips(data: PlaceShipsArgs) {
   await db.placedShip.placeShips(data);
}

export async function startGame(data: { gameId: string; playerIds: string[] }) {
   await db.game.startGame(data);
}

export async function getPlacedShips(data: GetShipsArgs) {
   await db.placedShip.getShips(data);
}

export async function makeMove(data: CreateMoveArgs) {
   return await db.move.create(data);
}
