import { BoardWithShips, BoardWithShipsAndHits, Move, PlacedShip } from "./types";

export function placeHitsOnGameBoard(
   moves: Move[],
   board: BoardWithShips,
   placedShips: PlacedShip[]
) {
   // Add the missing information of isHit and isSunk
   const newBoard: BoardWithShipsAndHits = board.map((row) =>
      row.map((cell) =>
         cell.isShip
            ? {
                 ...cell,
                 isHit: false,
                 isSunk: false,
              }
            : { ...cell, isHit: false }
      )
   );

   // Add hits
   moves.forEach((move) => {
      const cell = newBoard[move.y][move.x];
      cell.isHit = true;
   });

   // Determine if any ships are fully sunk
   let totalSunkShips = 0;
   placedShips.forEach((ship) => {
      const { coordinates, size, orientation } = ship;

      // Get all ship's cells based on orientation and size
      const shipCells = Array.from({ length: size }).map((_, i) => ({
         x: orientation === "horizontal" ? coordinates.x + i : coordinates.x,
         y: orientation === "vertical" ? coordinates.y + i : coordinates.y,
      }));

      // Check if all ship's cells are hit
      const isSunk = shipCells.every(({ x, y }) => newBoard[y][x].isHit);

      // Update board with sunk status
      if (isSunk) {
         shipCells.forEach(({ x, y }) => {
            const cell = newBoard[y][x];
            if (cell.isShip) {
               cell.isSunk = true;
            }
         });
         totalSunkShips++;
      }
   });

   const shipsRemaining = placedShips.length - totalSunkShips;

   return { board: newBoard, shipsRemaining };
}
