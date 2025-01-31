import { BoardCell, BoardWithShips } from "./types";

export function generateGameBoard(size: number): BoardWithShips {
   const board: BoardWithShips = [];
   for (let y = 0; y < size; y++) {
      const row: BoardCell[] = [];
      for (let x = 0; x < size; x++) {
         row.push({ x, y, isShip: false });
      }
      board.push(row);
   }
   return board;
}
