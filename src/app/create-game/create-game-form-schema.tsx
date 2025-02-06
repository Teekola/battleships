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
      carriers: z.number().min(shipLimits.carrier.min).max(shipLimits.carrier.max),
      battleships: z.number().min(shipLimits.battleship.min).max(shipLimits.battleship.max),
      cruisers: z.number().min(shipLimits.cruiser.min).max(shipLimits.cruiser.max),
      submarines: z.number().min(shipLimits.submarine.min).max(shipLimits.submarine.max),
      destroyers: z.number().min(shipLimits.destroyer.min).max(shipLimits.destroyer.max),
   })
   .superRefine((v, ctx) => {
      const { boardSize, carriers, battleships, cruisers, submarines, destroyers } = v;

      const boardArea = boardSize * boardSize;

      const shipArea = calculateShipArea({
         carrier: carriers,
         battleship: battleships,
         cruiser: cruisers,
         submarine: submarines,
         destroyer: destroyers,
      });

      if (shipArea < 2) {
         return ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Select at least one ship.",
         });
      }

      const shipDensity = shipArea / boardArea;

      if (shipDensity > MAX_SHIP_DENSITY) {
         return ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The area of the ships is too high for the selected board size.",
         });
      }
   });

export type CreateGameFormData = z.infer<typeof formSchema>;
