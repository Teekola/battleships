"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Coordinates, Move } from "../(utils)/types";
import { OpponentGameBoard } from "./opponent-game-board";
import { OwnGameBoard } from "./own-game-board";

export function Game() {
   const [ownMoves, setOwnMoves] = useState<Move[]>([]);
   const [opponentMoves, setOpponentMoves] = useState<Move[]>([]);
   const [turn, setTurn] = useState<string>("player1");
   const [hasPlayed, setHasPlayed] = useState(false);
   const boardSize = 6;

   const hitCoordinate = useCallback(
      (coordinates: Coordinates) => {
         if (turn !== "player1" || hasPlayed) return;
         setOwnMoves((prev) => prev.concat(coordinates));
         setHasPlayed(true);
         setTimeout(() => {
            setTurn("player2");
            setHasPlayed(false);
         }, 1500);
      },
      [turn, hasPlayed]
   );

   const handleOpponentHit = useCallback((coordinates: Coordinates) => {
      setOpponentMoves((prev) => prev.concat(coordinates));
      setTimeout(() => {
         setTurn("player1");
      }, 1500);
   }, []);

   // Simulate opponent, does not take into account if coordinate was already hit
   useEffect(() => {
      let timeout: NodeJS.Timeout;
      if (turn === "player2") {
         timeout = setTimeout(() => {
            handleOpponentHit({
               x: Math.round(Math.random() * (boardSize - 1)),
               y: Math.round(Math.random() * (boardSize - 1)),
            });
         }, 1000);
      }

      return () => {
         clearTimeout(timeout);
      };
   }, [turn, boardSize, handleOpponentHit]);

   return (
      <div>
         <div className="mx-auto max-w-5xl p-2">
            <p className={cn(turn === "player2" && "animate-pulse")}>
               {turn === "player1" ? "Your turn!" : "Waiting for opponent to play..."}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <section className={cn(turn === "player1" && "order-2 w-1/3 sm:order-1 sm:w-full")}>
                  <h2 className="mb-1 text-lg font-bold">Your Board</h2>

                  <OwnGameBoard
                     handleOpponentHit={handleOpponentHit}
                     size={boardSize}
                     moves={opponentMoves}
                     placedShips={[
                        {
                           coordinates: { x: 1, y: 1 },
                           id: "carrier",
                           shipType: "carrier",
                           size: 5,
                           orientation: "vertical",
                        },
                     ]}
                  />
               </section>
               <section
                  className={cn(
                     turn === "player1" && "order-1 sm:order-2",
                     turn === "player2" && "order-1 w-1/3 sm:order-2 sm:w-full"
                  )}
               >
                  <h2 className="mb-1 text-lg font-bold">Opponent&apos;s Board</h2>
                  <OpponentGameBoard
                     hitCoordinate={hitCoordinate}
                     size={boardSize}
                     placedShips={[
                        {
                           coordinates: { x: 2, y: 3 },
                           id: "submarine",
                           shipType: "submarine",
                           size: 3,
                           orientation: "horizontal",
                        },
                     ]}
                     moves={ownMoves}
                  />
               </section>
            </div>
         </div>
      </div>
   );
}
