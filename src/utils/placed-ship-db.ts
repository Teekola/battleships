import { Prisma, ShipOrientation, ShipType } from "@prisma/client";

import { ShipType as ShipTypeT } from "@/app/create-game/create-game-form-schema";
import { ShipOrientation as ShipOrientationT } from "@/app/game/[gameId]/(utils)/types";
import { PlacedShip } from "@/app/game/[gameId]/(utils)/types";
import { prisma } from "@/lib/prisma";

const defaultPlacedShipArgs = Prisma.validator<Prisma.PlacedShipDefaultArgs>()({
   select: {
      id: true,
      shipId: true,
      playerId: true,
      shipType: true,
      x: true,
      y: true,
      size: true,
      orientation: true,
   },
});

export type PlacedShipDBT = Prisma.PlacedShipGetPayload<typeof defaultPlacedShipArgs>;

function lowerCaseShipTypeToDBShipType(lowerCase: string) {
   const map: Record<string, ShipType> = {
      carrier: ShipType.CARRIER,
      battleship: ShipType.BATTLESHIP,
      cruiser: ShipType.CRUISER,
      submarine: ShipType.SUBMARINE,
      destroyer: ShipType.DESTROYER,
   };
   return map[lowerCase];
}

function lowerCaseOrientationToDBOrientation(lowerCase: string) {
   const map: Record<string, ShipOrientation> = {
      horizontal: ShipOrientation.HORIZONTAL,
      vertical: ShipOrientation.VERTICAL,
   };
   return map[lowerCase];
}

export function convertPlacedShipsDBTToPlacedShip(placedShipsDBT: PlacedShipDBT[]): PlacedShip[] {
   return placedShipsDBT.map((ship) => ({
      id: ship.id,
      shipId: ship.shipId,
      shipType: ship.shipType.toLowerCase() as ShipTypeT,
      coordinates: { x: ship.x, y: ship.y },
      size: ship.size,
      orientation: ship.orientation.toLowerCase() as ShipOrientationT,
   }));
}

export interface PlaceShipsArgs {
   placedShips: PlacedShip[];
   playerId: string;
   gameId: string;
}

export interface RemoveShipsArgs {
   ids?: number[];
   playerId: string;
   gameId: string;
}

export interface GetShipsArgs {
   gameId: string;
   playerId: string;
}

export class PlacedShipDB {
   constructor() {}

   async placeShips({ placedShips, playerId, gameId }: PlaceShipsArgs) {
      // Delete possible old placed ships and replace with new ones
      await prisma.$transaction([
         prisma.placedShip.deleteMany({
            where: { gameId, playerId },
         }),
         prisma.placedShip.createMany({
            data: placedShips.map((ship) => ({
               shipId: ship.shipId,
               gameId,
               playerId,
               shipType: lowerCaseShipTypeToDBShipType(ship.shipType),
               x: ship.coordinates.x,
               y: ship.coordinates.y,
               size: ship.size,
               orientation: lowerCaseOrientationToDBOrientation(ship.orientation),
            })),
         }),
      ]);
   }

   async removePlayersShips({ playerId, gameId, ids }: RemoveShipsArgs) {
      await prisma.placedShip.deleteMany({
         where: { gameId, playerId, ...(ids && { id: { in: ids.map(Number) } }) },
      });
   }

   async getShips({ gameId, playerId }: GetShipsArgs) {
      const ships = await prisma.placedShip.findMany({
         where: { gameId, playerId },
         select: defaultPlacedShipArgs.select,
      });
      return ships;
   }
}
