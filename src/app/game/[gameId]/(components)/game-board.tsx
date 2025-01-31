import { useMemo } from "react";

import { generateGameBoard } from "../(utils)/generate-game-board";
import { placeShipsOnGameBoard } from "../(utils)/place-ships-on-game-board";
import { HoveredCells, PlacedShip } from "../(utils)/types";
import { DraggableShip } from "./draggable-ship";
import { DroppableCell } from "./droppable-cell";
import { ShipPiece } from "./ship-piece";

export function GameBoard({
   size,
   cellSize,
   hoveredCells,
   placedShips,
}: Readonly<{
   size: number;
   hoveredCells: HoveredCells;
   placedShips: PlacedShip[];
   cellSize: number;
}>) {
   const board = useMemo(() => {
      const gameBoard = generateGameBoard(size);
      placeShipsOnGameBoard(placedShips, gameBoard);
      return gameBoard;
      // cellSize is also needed so that everything is replaced correctly
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [size, placedShips, cellSize]);

   return (
      <div className="max-h-lg aspect-square max-w-lg">
         <div
            className="grid h-full w-full bg-blue-950"
            style={{
               gridTemplateColumns: `repeat(${size}, 1fr)`,
               gridTemplateRows: `repeat(${size}, 1fr)`,
            }}
         >
            {board.flat().map((cell) => (
               <DroppableCell
                  key={`${cell.x}-${cell.y}`}
                  coordinates={{ x: cell.x, y: cell.y }}
                  isShip={cell.isShip}
                  canPlace={hoveredCells.canPlace && !cell.isShip}
                  isShipOver={hoveredCells.coordinates.some(
                     (hoveredCell) => cell.x === hoveredCell.x && cell.y === hoveredCell.y
                  )}
               >
                  {cell.isShip && (
                     <DraggableShip
                        size={cell.shipSize}
                        orientation={cell.shipOrientation}
                        id={cell.shipId}
                     >
                        <ShipPiece
                           cellSize={cellSize}
                           shipPiece={cell.shipPiece}
                           orientation={cell.shipOrientation}
                        />
                     </DraggableShip>
                  )}
               </DroppableCell>
            ))}
         </div>
      </div>
   );
}
