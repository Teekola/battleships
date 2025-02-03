import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { generateGameBoard } from "../(utils)/generate-game-board";
import { placeHitsOnGameBoard } from "../(utils)/place-hits-on-game-board";
import { placeShipsOnGameBoard } from "../(utils)/place-ships-on-game-board";
import { Coordinates, Move, PlacedShip } from "../(utils)/types";
import { ShipPiece } from "./ship-piece";

export function OwnGameBoard({
   size,
   moves,
   placedShips,
}: Readonly<{
   size: number;
   placedShips: PlacedShip[];
   moves: Move[];
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

function HitOverlay({ isShip }: { isShip: boolean }) {
   const ref = useRef<HTMLDivElement | null>(null);
   const [offsets, setOffsets] = useState<Coordinates>({ x: 0, y: 0 });

   // Calculate the distance from the element to the top-left corner of the viewport
   useEffect(() => {
      if (ref.current) {
         const rect = ref.current.getBoundingClientRect();
         const offsetX = rect.left;
         const offsetY = rect.top;
         setOffsets({ x: offsetX, y: offsetY });
      }
   }, []);

   return (
      <div
         style={
            {
               "--hit-offset-x": `-${offsets.x}px`,
               "--hit-offset-y": `-${offsets.y}px`,
            } as React.CSSProperties
         }
         ref={ref}
         className={cn(
            "absolute left-1/2 top-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white",
            isShip && "bg-red-500",
            offsets.x === 0 && "opacity-0",
            offsets.x !== 0 && "animate-hit"
         )}
      ></div>
   );
}
