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

   // Track total hits and sunk ships
   let totalSunkShips = 0;
   let totalHits = 0;

   placedShips.forEach(({ coordinates, size, orientation }) => {
      const shipCells = Array.from({ length: size }, (_, i) => ({
         x: orientation === "horizontal" ? coordinates.x + i : coordinates.x,
         y: orientation === "vertical" ? coordinates.y + i : coordinates.y,
      }));

      let shipHits = 0;

      // Count hits and check if ship is fully sunk in one loop
      shipCells.forEach(({ x, y }) => {
         const cell = newBoard[y][x];
         if (cell.isShip && cell.isHit) {
            shipHits++;
            totalHits++;
         }
      });

      if (shipHits === size) {
         totalSunkShips++;
         shipCells.forEach(({ x, y }) => {
            const cell = newBoard[y][x];
            if (cell.isShip) {
               cell.isSunk = true;
            }
         });
      }
   });

   const hitsToSinkAll = placedShips.reduce((sum, { size }) => sum + size, 0);
   const hitsRemaining = hitsToSinkAll - totalHits;
   const shipsRemaining = placedShips.length - totalSunkShips;

   return { board: newBoard, shipsRemaining, hitsRemaining };
}
