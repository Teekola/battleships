"use client";

import { z } from "zod";

export const shipSizes = {
   carrier: 5,
   battleship: 4,
   cruiser: 3,
   submarine: 3,
   destroyer: 2,
};

export const boardSizeOptions = [5, 6, 7, 8, 9, 10];

type ShipToShipNumber = typeof shipSizes;
export type ShipType = keyof typeof shipSizes;

export const shipLimits = {
   carrier: { min: 0, max: 2 },
   battleship: { min: 0, max: 4 },
   cruiser: { min: 0, max: 4 },
   submarine: { min: 0, max: 4 },
   destroyer: { min: 0, max: 4 },
} as const;

// Generate an array of numbers from min to max for each shiptype
export const shipAmountOptionsByShipType = Object.keys(shipLimits).reduce(
   (shipOptions, shipType) => {
      const { min, max } = shipLimits[shipType as ShipType];

      // Generate the array of stringified numbers from min to max
      shipOptions[shipType as ShipType] = Array.from(
         { length: max - min + 1 },
         (_, index) => min + index
      );

      return shipOptions;
   },
   {} as Record<ShipType, number[]>
);

const MAX_SHIP_DENSITY = 0.5;

function calculateShipArea(ships: ShipToShipNumber) {
   return Object.keys(ships).reduce((a, shipType) => {
      const newArea = a + ships[shipType as ShipType] * shipSizes[shipType as ShipType];
      return newArea;
   }, 0);
}

export const formSchema = z
   .object({
      boardSize: z.number().min(5).max(10),
      nCarrier: z.number().min(shipLimits.carrier.min).max(shipLimits.carrier.max),
      nBattleship: z.number().min(shipLimits.battleship.min).max(shipLimits.battleship.max),
      nCruiser: z.number().min(shipLimits.cruiser.min).max(shipLimits.cruiser.max),
      nSubmarine: z.number().min(shipLimits.submarine.min).max(shipLimits.submarine.max),
      nDestroyer: z.number().min(shipLimits.destroyer.min).max(shipLimits.destroyer.max),
   })
   .refine((v) => {
      const { boardSize, nCarrier, nBattleship, nCruiser, nSubmarine, nDestroyer } = v;

      const boardArea = boardSize * boardSize;

      const shipArea = calculateShipArea({
         carrier: nCarrier,
         battleship: nBattleship,
         cruiser: nCruiser,
         submarine: nSubmarine,
         destroyer: nDestroyer,
      });

      const shipDensity = shipArea / boardArea;

      if (shipDensity > MAX_SHIP_DENSITY) {
         return false;
      }

      return true;
   });

export type CreateGameFormData = z.infer<typeof formSchema>;
