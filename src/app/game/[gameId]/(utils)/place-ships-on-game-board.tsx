import { BoardWithShips, PlacedShip } from "./types";

export function placeShipsOnGameBoard(ships: PlacedShip[], board: BoardWithShips) {
   ships.forEach(({ coordinates, orientation, size, shipId }) => {
      const { x, y } = coordinates;
      for (let i = 0; i < size; i++) {
         const isStart = i === 0;
         const isEnd = i === size - 1;
         const shipPiece = isStart ? "start" : isEnd ? "end" : "mid";

         if (orientation === "horizontal") {
            board[y][x + i] = {
               x: x + i,
               y,
               isShip: true,
               shipId,
               shipSize: size,
               shipOrientation: orientation,
               shipPiece,
            };
         } else {
            board[y + i][x] = {
               x,
               y: y + i,
               isShip: true,
               shipId,
               shipSize: size,
               shipOrientation: orientation,
               shipPiece,
            };
         }
      }
   });
}
