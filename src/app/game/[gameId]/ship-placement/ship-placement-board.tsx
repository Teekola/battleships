import { useMemo } from "react";

import { ShipPiece } from "../(components)/ship-piece";
import { generateGameBoard } from "../(utils)/generate-game-board";
import { placeShipsOnGameBoard } from "../(utils)/place-ships-on-game-board";
import { HoveredCells, PlacedShip } from "../(utils)/types";
import { DraggableShip } from "./draggable-ship";
import { DroppableCell } from "./droppable-cell";

export function ShipPlacementBoard({
   size,
   hoveredCells,
   placedShips,
}: Readonly<{
   size: number;
   hoveredCells: HoveredCells;
   placedShips: PlacedShip[];
}>) {
   const board = useMemo(() => {
      const gameBoard = generateGameBoard(size);
      placeShipsOnGameBoard(placedShips, gameBoard);
      return gameBoard;
   }, [size, placedShips]);

   return (
      <div className="aspect-square">
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
                        shipId={cell.shipId}
                     >
                        <ShipPiece shipPiece={cell.shipPiece} orientation={cell.shipOrientation} />
                     </DraggableShip>
                  )}
               </DroppableCell>
            ))}
         </div>
      </div>
   );
}
