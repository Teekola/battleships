"use server";

import { GameState } from "@prisma/client";

import { db } from "@/utils/db";
import { ChangeTurnArgs, RestartGameArgs, UpdateGameArgs } from "@/utils/game-db";
import { CreateMoveArgs } from "@/utils/move-db";
import { GetShipsArgs, PlaceShipsArgs, RemoveShipsArgs } from "@/utils/placed-ship-db";

export async function placeShips(data: PlaceShipsArgs) {
   await db.placedShip.placeShips(data);
}

export async function removePlayersShips(data: RemoveShipsArgs) {
   await db.placedShip.removePlayersShips(data);
}

export async function startGame(data: { gameId: string; playerIds: string[] }) {
   const game = await db.game.getById(data.gameId);
   if (!game) throw new Error("The game does not exist.");
   if (game.state === GameState.PLAYING) return;
   await db.game.startGame(data);
}

export async function restartGame(data: RestartGameArgs) {
   const game = await db.game.getById(data.gameId);
   if (!game) throw new Error("The game does not exist.");
   if (game.state === GameState.SHIP_PLACEMENT) return;
   await db.game.restartGame(data);
}

export async function getPlacedShips(data: GetShipsArgs) {
   await db.placedShip.getShips(data);
}

export async function makeMove(data: CreateMoveArgs) {
   return await db.move.create(data);
}

export async function updateGame(data: UpdateGameArgs) {
   const game = await db.game.update(data);
   return game;
}

export async function changeTurn(data: ChangeTurnArgs) {
   const game = await db.game.changeTurn(data);
   return game;
}
