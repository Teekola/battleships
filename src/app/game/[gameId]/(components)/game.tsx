"use client";

import { useCallback, useState } from "react";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";
import { Game as GameT } from "@/utils/game-db";
import { AllMovesByPlayerId } from "@/utils/move-db";

import { useGame } from "../(hooks)/use-game";
import { useMoves } from "../(hooks)/use-moves";
import { Coordinates } from "../(utils)/types";
import { updateGame } from "../join/actions";
import { makeMove } from "./actions";
import { OpponentGameBoard } from "./opponent-game-board";
import { OwnGameBoard } from "./own-game-board";

export function Game({
   initialGame,
   initialMoves,
}: Readonly<{ initialGame: GameT; initialMoves: AllMovesByPlayerId }>) {
   const { game, currentTurn } = useGame(initialGame);
   const { ownMoves, opponentMoves, addMove } = useMoves({ initialMoves, initialGame });

   const { playerId } = usePlayer();

   const isPlayer1 = game.player1Id === playerId;
   const opponentId = isPlayer1 ? game.player2Id! : game.player1Id!;
   const [hasPlayed, setHasPlayed] = useState(false);

   const hitCoordinate = useCallback(
      async (coordinates: Coordinates) => {
         if (currentTurn !== playerId || hasPlayed) return;

         setHasPlayed(true);

         addMove({
            id: 9999,
            gameId: game.id,
            playerId,
            x: coordinates.x,
            y: coordinates.y,
            isPlayer1,
         });

         await makeMove({
            gameId: game.id,
            playerId,
            x: coordinates.x,
            y: coordinates.y,
         });

         setTimeout(async () => {
            await updateGame({ gameId: game.id, currentTurn: opponentId });
            setHasPlayed(false);
         }, 1500);
      },
      [currentTurn, playerId, hasPlayed, addMove, game.id, isPlayer1, opponentId]
   );

   return (
      <div>
         <div className="mx-auto max-w-5xl p-2">
            <p className={cn(currentTurn === opponentId && "animate-pulse")}>
               {currentTurn === playerId ? "Your turn!" : "Waiting for opponent to play..."}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <section
                  className={cn(currentTurn === playerId && "order-2 w-1/3 sm:order-1 sm:w-full")}
               >
                  <h2 className="mb-1 text-lg font-bold">Your Board</h2>

                  <OwnGameBoard
                     size={game.boardSize}
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
                     currentTurn === playerId && "order-1 sm:order-2",
                     currentTurn === opponentId && "order-1 w-1/3 sm:order-2 sm:w-full"
                  )}
               >
                  <h2 className="mb-1 text-lg font-bold">Opponent&apos;s Board</h2>
                  <OpponentGameBoard
                     hitCoordinate={hitCoordinate}
                     size={game.boardSize}
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
