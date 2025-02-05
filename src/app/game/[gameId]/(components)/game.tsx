"use client";

import { useCallback, useState } from "react";

import { GameState } from "@prisma/client";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";
import { Game as GameT } from "@/utils/game-db";
import { AllMovesByPlayerId } from "@/utils/move-db";
import { PlacedShipDBT, convertPlacedShipsDBTToPlacedShip } from "@/utils/placed-ship-db";

import { useGame } from "../(hooks)/use-game";
import { useMoves } from "../(hooks)/use-moves";
import { useGameStore } from "../(stores)/game-store-provider";
import { checkGameEnd } from "../(utils)/check-game-end";
import { Coordinates } from "../(utils)/types";
import { makeMove } from "../actions";
import { updateGame } from "../actions";
import { GameFinishedDialog } from "./game-finished-dialog";
import { OpponentGameBoard } from "./opponent-game-board";
import { OwnGameBoard } from "./own-game-board";

export function Game({
   initialGame,
   initialMoves,
   initialPlayer1PlacedShips,
   initialPlayer2PlacedShips,
}: Readonly<{
   initialGame: GameT;
   initialMoves: AllMovesByPlayerId;
   initialPlayer1PlacedShips: PlacedShipDBT[];
   initialPlayer2PlacedShips: PlacedShipDBT[];
}>) {
   const { game, currentTurn } = useGame(initialGame);
   const { ownMoves, opponentMoves, addMove } = useMoves({ initialMoves, initialGame });
   const ownShipsRemaining = useGameStore((s) => s.ownShipsRemaining);
   const opponentShipsRemaining = useGameStore((s) => s.opponentShipsRemaining);
   const ownHitsRemaining = useGameStore((s) => s.ownHitsRemaining);
   const opponentHitsRemaining = useGameStore((s) => s.opponentHitsRemaining);
   const { playerId, hasHydrated } = usePlayer();
   const isPlayer1 = game.player1Id === playerId;
   const ownShips = isPlayer1 ? initialPlayer1PlacedShips : initialPlayer2PlacedShips;
   const opponentShips = isPlayer1 ? initialPlayer2PlacedShips : initialPlayer1PlacedShips;
   const opponentId = isPlayer1 ? game.player2Id! : game.player1Id!;
   const [hasPlayed, setHasPlayed] = useState(false);
   const setGameEndReason = useGameStore((s) => s.setGameEndReason);
   const setWinnerId = useGameStore((s) => s.setWinnerId);

   const hitCoordinate = useCallback(
      async (coordinates: Coordinates) => {
         if (currentTurn !== playerId || hasPlayed) return;

         setHasPlayed(true);

         const { ownMoves: newOwnMoves, opponentMoves: newOpponentMoves } = addMove({
            id: 9999,
            gameId: game.id,
            playerId,
            x: coordinates.x,
            y: coordinates.y,
            isOwnMove: true,
         });

         await makeMove({
            gameId: game.id,
            playerId,
            x: coordinates.x,
            y: coordinates.y,
         });

         setTimeout(async () => {
            const { gameState, gameEndReason, winnerId } = await checkGameEnd({
               ownHitsRemaining: ownHitsRemaining ?? 2,
               opponentHitsRemaining: opponentHitsRemaining ?? 2,
               gameId: game.id,
               opponentId,
               playerId,
               ownMoves: newOwnMoves,
               opponentMoves: newOpponentMoves,
            });

            if (gameState === GameState.FINISHED) {
               setGameEndReason(gameEndReason);
               if (winnerId) setWinnerId(winnerId);
               return;
            }

            await updateGame({ gameId: game.id, currentTurn: opponentId });
            setHasPlayed(false);
         }, 1500);
      },
      [
         currentTurn,
         playerId,
         hasPlayed,
         game,
         addMove,
         ownHitsRemaining,
         opponentHitsRemaining,
         setGameEndReason,
         setWinnerId,
         opponentId,
      ]
   );

   if (!hasHydrated) {
      return null;
   }

   return (
      <>
         <GameFinishedDialog initialGame={initialGame} />
         <div>
            <div className="mx-auto max-w-5xl p-2">
               <p className={cn(currentTurn === opponentId && "animate-pulse")}>
                  {currentTurn === playerId ? "Your turn!" : "Waiting for opponent to play..."}
               </p>
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <section
                     className={cn(
                        currentTurn === playerId && "order-2 w-1/3 sm:order-1 sm:w-full"
                     )}
                  >
                     <h2 className="mb-1 text-lg font-bold">Your Board</h2>

                     <OwnGameBoard
                        size={game.boardSize}
                        moves={opponentMoves}
                        placedShips={convertPlacedShipsDBTToPlacedShip(ownShips)}
                     />
                     <p>{ownShipsRemaining} ships remaining</p>
                     {opponentHitsRemaining === 1 &&
                        ownHitsRemaining === 0 &&
                        opponentMoves.length < ownMoves.length && (
                           <p>Opponent can still tie the game with a hit!</p>
                        )}
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
                        placedShips={convertPlacedShipsDBTToPlacedShip(opponentShips)}
                        moves={ownMoves}
                     />
                     <p>{opponentShipsRemaining} ships remaining</p>

                     {ownHitsRemaining === 1 &&
                        opponentHitsRemaining === 0 &&
                        ownMoves.length < opponentMoves.length && <p>Hit to tie the game!</p>}
                  </section>
               </div>
            </div>
         </div>
      </>
   );
}
