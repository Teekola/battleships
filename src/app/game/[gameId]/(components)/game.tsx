"use client";

import { useCallback, useMemo } from "react";

import { GameMode } from "@prisma/client";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";
import { Game as GameT } from "@/utils/game-db";
import { AllMovesByPlayerId } from "@/utils/move-db";
import { PlacedShipDBT, convertPlacedShipsDBTToPlacedShip } from "@/utils/placed-ship-db";

import { useAudio } from "../(hooks)/use-audio";
import { useCheckGameEnd } from "../(hooks)/use-check-game-end";
import { useGame } from "../(hooks)/use-game";
import { useMoves } from "../(hooks)/use-moves";
import { useGameStore } from "../(stores)/game-store-provider";
import { getAllShipsCoordinates } from "../(utils)/get-all-ships-coordinates";
import { Coordinates } from "../(utils)/types";
import { changeTurn, makeMove } from "../actions";
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
   const { ownMoves, opponentMoves, addMove } = useMoves({
      initialMoves,
      initialGame,
      initialPlayer1PlacedShips,
      initialPlayer2PlacedShips,
   });
   const ownShipsRemaining = useGameStore((s) => s.ownShipsRemaining);
   const opponentShipsRemaining = useGameStore((s) => s.opponentShipsRemaining);
   const ownHitsRemaining = useGameStore((s) => s.ownHitsRemaining);
   const opponentHitsRemaining = useGameStore((s) => s.opponentHitsRemaining);
   const ownTurnsPlayed = useGameStore((s) => s.ownTurnsPlayed);
   const opponentTurnsPlayed = useGameStore((s) => s.opponentTurnsPlayed);
   const hasPlayed = useGameStore((s) => s.hasPlayed);
   const setHasPlayed = useGameStore((s) => s.setHasPlayed);
   const incrementOwnTurnsPlayed = useGameStore((s) => s.incrementOwnTurnsPlayed);
   const { playerId, hasHydrated } = usePlayer();

   const isPlayer1 = hasHydrated ? game.player1Id === playerId : null;
   const ownShips = useMemo(
      () => (isPlayer1 ? initialPlayer1PlacedShips : initialPlayer2PlacedShips),
      [isPlayer1, initialPlayer1PlacedShips, initialPlayer2PlacedShips]
   );
   const opponentShips = useMemo(
      () => (isPlayer1 ? initialPlayer2PlacedShips : initialPlayer1PlacedShips),
      [isPlayer1, initialPlayer1PlacedShips, initialPlayer2PlacedShips]
   );

   const opponentId = hasHydrated ? (isPlayer1 ? game.player2Id! : game.player1Id!) : null;

   useCheckGameEnd(initialGame);
   const opponentShipsCoordinates = useMemo(
      () =>
         getAllShipsCoordinates({
            placedShips: convertPlacedShipsDBTToPlacedShip(opponentShips),
         }),
      [opponentShips]
   );

   const { playWaterHitSound, playShipHitSound } = useAudio();

   const hitCoordinate = useCallback(
      async (coordinates: Coordinates) => {
         if (currentTurn !== playerId || hasPlayed || !hasHydrated || isPlayer1 === null) return;

         setHasPlayed(true);

         addMove({
            id: 9999,
            gameId: game.id,
            playerId,
            x: coordinates.x,
            y: coordinates.y,
            isOwnMove: true,
         });

         const isHit = opponentShipsCoordinates.has(`${coordinates.x},${coordinates.y}`);

         const audioFunction = isHit ? playShipHitSound : playWaterHitSound;
         setTimeout(() => {
            audioFunction();
         }, 150);

         await makeMove({
            gameId: game.id,
            playerId,
            x: coordinates.x,
            y: coordinates.y,
         });

         if (game.gameMode === GameMode.RAMPAGE && isHit) {
            const newOwnHitsRemaining = (ownHitsRemaining ?? 2) - 1;
            if (newOwnHitsRemaining > 0) {
               setHasPlayed(false);
               return;
            }
         }

         incrementOwnTurnsPlayed();

         await changeTurn({ gameId: game.id, nextTurn: opponentId!, isPlayer1 });
      },
      [
         ownHitsRemaining,
         currentTurn,
         playerId,
         hasPlayed,
         hasHydrated,
         isPlayer1,
         setHasPlayed,
         addMove,
         game.id,
         game.gameMode,
         opponentShipsCoordinates,
         playShipHitSound,
         playWaterHitSound,
         incrementOwnTurnsPlayed,
         opponentId,
      ]
   );

   if (!hasHydrated || opponentId === null || isPlayer1 === null || !currentTurn) {
      return null;
   }

   return (
      <>
         <GameFinishedDialog initialGame={initialGame} />

         <p className={cn(currentTurn === opponentId && "animate-pulse")}>
            {currentTurn === playerId ? "Your turn!" : "Waiting for opponent to play..."}
         </p>
         <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
            <section
               className={cn(
                  "absolute flex w-full flex-col gap-2 opacity-100 transition-opacity duration-500 sm:static",
                  currentTurn === playerId && "opacity-0 sm:opacity-75"
               )}
            >
               <h2 className="text-lg font-bold">Your Board</h2>

               <OwnGameBoard
                  size={game.boardSize}
                  moves={opponentMoves}
                  placedShips={convertPlacedShipsDBTToPlacedShip(ownShips)}
               />
               <p>{ownShipsRemaining} ships remaining</p>
               {game.gameMode === GameMode.RAMPAGE &&
                  ownHitsRemaining === 0 &&
                  (opponentTurnsPlayed ?? 0) < (ownTurnsPlayed ?? 0) && (
                     <p>Opponent can still tie the game if they don&apos;t miss</p>
                  )}
               {game.gameMode === GameMode.CLASSIC &&
                  opponentHitsRemaining === 1 &&
                  ownHitsRemaining === 0 &&
                  opponentMoves.length < ownMoves.length && (
                     <p>Opponent can still tie the game with a hit!</p>
                  )}
            </section>
            <section
               className={cn(
                  "absolute flex w-full flex-col gap-2 opacity-100 transition-opacity duration-500 sm:static",
                  currentTurn === opponentId && "opacity-0 sm:opacity-75"
               )}
            >
               <h2 className="text-lg font-bold">Opponent&apos;s Board</h2>
               <OpponentGameBoard
                  hitCoordinate={hitCoordinate}
                  size={game.boardSize}
                  placedShips={convertPlacedShipsDBTToPlacedShip(opponentShips)}
                  moves={ownMoves}
               />
               <p>{opponentShipsRemaining} ships remaining</p>

               {game.gameMode === GameMode.RAMPAGE &&
                  opponentHitsRemaining === 0 &&
                  (opponentTurnsPlayed ?? 0) > (ownTurnsPlayed ?? 0) && (
                     <p>Hit all your shots to tie the game!</p>
                  )}
               {game.gameMode === GameMode.CLASSIC &&
                  ownHitsRemaining === 1 &&
                  opponentHitsRemaining === 0 &&
                  ownMoves.length < opponentMoves.length && <p>Hit to tie the game!</p>}
            </section>
         </div>
      </>
   );
}
