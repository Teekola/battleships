import { PlacedShip } from "./types";

export function getAllShipsCoordinates({ placedShips }: { placedShips: PlacedShip[] }) {
   const newAllShipsCoordinates = new Set<string>();
   for (const { orientation, size, coordinates } of placedShips) {
      if (orientation === "horizontal") {
         for (let i = 0; i < size; i++) {
            newAllShipsCoordinates.add(`${coordinates.x + i},${coordinates.y}`);
         }
      } else if (orientation === "vertical") {
         for (let i = 0; i < size; i++) {
            newAllShipsCoordinates.add(`${coordinates.x},${coordinates.y + i}`);
         }
      }
   }
   return newAllShipsCoordinates;
}
