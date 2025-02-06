"use client";

import { useEffect, useMemo } from "react";

import { useGameStore } from "../(stores)/game-store-provider";
import { generateGameBoard } from "../(utils)/generate-game-board";
import { placeHitsOnGameBoard } from "../(utils)/place-hits-on-game-board";
import { placeShipsOnGameBoard } from "../(utils)/place-ships-on-game-board";
import { Move, PlacedShip } from "../(utils)/types";
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
}>) {
   const setOwnShipsRemaining = useGameStore((s) => s.setOwnShipsRemaining);
   const setOpponentHitsRemaining = useGameStore((s) => s.setOpponentHitsRemaining);

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
      setOwnShipsRemaining(shipsRemaining);
   }, [shipsRemaining, setOwnShipsRemaining]);

   useEffect(() => {
      setOpponentHitsRemaining(hitsRemaining);
   }, [hitsRemaining, setOpponentHitsRemaining]);

   return (
      <div
         className="grid aspect-square w-full bg-blue-950"
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
   );
}
