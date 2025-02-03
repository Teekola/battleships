"use client";

import { useCallback, useState } from "react";

import { Coordinates, Move } from "../(utils)/types";
import { OpponentGameBoard } from "./opponent-game-board";
import { OwnGameBoard } from "./own-game-board";

export function Game() {
   const [ownMoves, setOwnMoves] = useState<Move[]>([]);
   const [opponentMoves, setOpponentMoves] = useState<Move[]>([]);

   const hitCoordinate = useCallback((coordinates: Coordinates) => {
      setOwnMoves((prev) => prev.concat(coordinates));
   }, []);

   const handleOpponentHit = useCallback((coordinates: Coordinates) => {
      setOpponentMoves((prev) => prev.concat(coordinates));
   }, []);

   return (
      <div>
         <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
            <OwnGameBoard
               handleOpponentHit={handleOpponentHit}
               size={6}
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
            <OpponentGameBoard
               hitCoordinate={hitCoordinate}
               size={6}
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
         </div>
      </div>
   );
}
