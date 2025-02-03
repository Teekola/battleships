import { useMemo } from "react";

import { generateGameBoard } from "../(utils)/generate-game-board";
import { placeHitsOnGameBoard } from "../(utils)/place-hits-on-game-board";
import { placeShipsOnGameBoard } from "../(utils)/place-ships-on-game-board";
import { Coordinates, Move, PlacedShip } from "../(utils)/types";
import { HitOverlay } from "./hit-overlay";
import { ShipPiece } from "./ship-piece";

export function OwnGameBoard({
   size,
   moves,
   placedShips,
}: Readonly<{
   size: number;
   placedShips: PlacedShip[];
   moves: Move[];
   handleOpponentHit: (coordinates: Coordinates) => void;
}>) {
   const board = useMemo(() => {
      const gameBoard = generateGameBoard(size);
      placeShipsOnGameBoard(placedShips, gameBoard);
      return placeHitsOnGameBoard(moves, gameBoard, placedShips);
   }, [moves, size, placedShips]);

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
               <div
                  key={`${cell.x}-${cell.y}`}
                  className="relative flex h-full w-full items-center justify-center"
               >
                  {cell.isHit && <HitOverlay isShip={cell.isShip} />}
                  {cell.isShip && (
                     <ShipPiece
                        shipPiece={cell.shipPiece}
                        orientation={cell.shipOrientation}
                        isSunk={cell.isSunk}
                     />
                  )}
                  {!cell.isShip && <div className="h-1/4 w-1/4 rounded-full bg-blue-300/20"></div>}
               </div>
            ))}
         </div>
      </div>
   );
}
