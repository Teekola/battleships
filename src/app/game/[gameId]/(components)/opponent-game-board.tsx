"use client";

import { useEffect, useMemo } from "react";

import { cn } from "@/lib/utils";

import { useGameStore } from "../(stores)/game-store-provider";
import { generateGameBoard } from "../(utils)/generate-game-board";
import { placeHitsOnGameBoard } from "../(utils)/place-hits-on-game-board";
import { placeShipsOnGameBoard } from "../(utils)/place-ships-on-game-board";
import { Coordinates, Move, PlacedShip } from "../(utils)/types";
import { HitOverlay } from "./hit-overlay";
import { ShipPiece } from "./ship-piece";

export function OpponentGameBoard({
   size,
   moves,
   placedShips,
   hitCoordinate,
}: Readonly<{
   size: number;
   placedShips: PlacedShip[];
   moves: Move[];
   hitCoordinate: (coordinates: Coordinates) => void;
}>) {
   const setOpponentShipsRemaining = useGameStore((s) => s.setOpponentShipsRemaining);
   const setOwnHitsRemaining = useGameStore((s) => s.setOwnHitsRemaining);
   const { board, shipsRemaining, hitsRemaining } = useMemo(() => {
      const gameBoard = generateGameBoard(size);
      placeShipsOnGameBoard(placedShips, gameBoard);
      const {
         board: boardWithHits,
         shipsRemaining,
         hitsRemaining,
      } = placeHitsOnGameBoard(moves, gameBoard, placedShips);

      return { board: boardWithHits, shipsRemaining, hitsRemaining };
   }, [size, placedShips, moves]);

   useEffect(() => {
      setOpponentShipsRemaining(shipsRemaining);
   }, [shipsRemaining, setOpponentShipsRemaining]);

   useEffect(() => {
      setOwnHitsRemaining(hitsRemaining);
   }, [hitsRemaining, setOwnHitsRemaining]);

   return (
      <div
         className="grid aspect-square w-full rounded-lg bg-blue-950"
         style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
         }}
      >
         {board.flat().map((cell) => (
            <div
               key={`${cell.x}-${cell.y}`}
               {...(!cell.isHit && { onClick: () => hitCoordinate({ x: cell.x, y: cell.y }) })}
               className={cn(
                  "group relative flex h-full w-full items-center justify-center",
                  !cell.isHit && "cursor-pointer"
               )}
            >
               {cell.isHit && <HitOverlay isShip={cell.isShip} />}
               {cell.isShip && cell.isSunk && (
                  <ShipPiece
                     shipPiece={cell.shipPiece}
                     orientation={cell.shipOrientation}
                     isSunk={cell.isSunk}
                  />
               )}
               {!cell.isHit && (
                  <div className="h-1/4 w-1/4 rounded-full bg-blue-300/20 group-hover:bg-blue-400"></div>
               )}
            </div>
         ))}
      </div>
   );
}
