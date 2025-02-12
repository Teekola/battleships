"use client";

import { Fragment, useCallback, useEffect, useId, useMemo, useState } from "react";

import {
   DndContext,
   DragEndEvent,
   DragMoveEvent,
   DragOverlay,
   DragStartEvent,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { Coordinates } from "@dnd-kit/utilities";
import throttle from "lodash.throttle";
import { ArrowLeftRightIcon, ArrowUpDownIcon, RefreshCwIcon } from "lucide-react";

import { ShipType, shipSizes } from "@/app/create-game/create-game-form-schema";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";
import { Game } from "@/utils/game-db";
import { PlacedShipDBT, convertPlacedShipsDBTToPlacedShip } from "@/utils/placed-ship-db";

import { Ship } from "../(components)/ship";
import { useClearSelectionOnRelease } from "../(hooks)/use-clear-selection-on-resize";
import { useGame } from "../(hooks)/use-game";
import { useOrientation } from "../(hooks)/use-orientation";
import { usePlayersReadyState } from "../(hooks)/use-players-ready-state";
import { getAllShipsCoordinates } from "../(utils)/get-all-ships-coordinates";
import {
   HoveredCell,
   HoveredCells,
   PlacedShip,
   ShipAmounts,
   ShipOrientation,
} from "../(utils)/types";
import { placeShips, removePlayersShips } from "../actions";
import { ShipCatalogue } from "./ship-catalogue";
import { ShipPlacementBoard } from "./ship-placement-board";

function checkIfHasPlacedAllShips(shipsToPlace: ShipAmounts) {
   return Object.keys(shipsToPlace).every((key) => shipsToPlace[key as ShipType] < 1);
}

function adjustShipsToPlace(
   placedShips: PlacedShip[],
   initialShipsToPlace: ShipAmounts
): ShipAmounts {
   // Count occurrences of each ship type in placedShips
   const placedShipCounts = placedShips.reduce<Record<ShipType, number>>(
      (acc, { shipType }) => ({
         ...acc,
         [shipType]: (acc[shipType] || 0) + 1,
      }),
      {} as Record<ShipType, number>
   );

   return Object.fromEntries(
      Object.entries(initialShipsToPlace).map(([shipType, count]) => [
         shipType,
         Math.max(0, count - (placedShipCounts[shipType as ShipType] || 0)),
      ])
   ) as ShipAmounts;
}

export function ShipPlacement({
   initialGame,
   initialPlayer1PlacedShips,
   initialPlayer2PlacedShips,
}: Readonly<{
   initialGame: Game;
   initialPlayer1PlacedShips: PlacedShipDBT[];
   initialPlayer2PlacedShips: PlacedShipDBT[];
}>) {
   const { playerId, hasHydrated } = usePlayer();

   if (!hasHydrated) {
      return null;
   }

   const isPlayer1 = initialGame.player1Id === playerId;

   return (
      <ShipPlacementView
         initialGame={initialGame}
         initialOwnShips={isPlayer1 ? initialPlayer1PlacedShips : initialPlayer2PlacedShips}
      />
   );
}

export function ShipPlacementView({
   initialGame,
   initialOwnShips,
}: Readonly<{
   initialGame: Game;
   initialOwnShips: PlacedShipDBT[];
}>) {
   const { game, error } = useGame(initialGame);
   const { playerId, hasHydrated } = usePlayer();

   const [placedShips, setPlacedShips] = useState<PlacedShip[]>(
      convertPlacedShipsDBTToPlacedShip(initialOwnShips)
   );

   const id = useId();
   const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
   const [draggingId, setDraggingId] = useState<string | null>(null);

   const [hoveredCells, setHoveredCells] = useState<HoveredCells>({
      canPlace: false,
      coordinates: [],
   });
   const allShipsCoordinates = useMemo(
      () => getAllShipsCoordinates({ placedShips }),
      [placedShips]
   );

   const shipsToPlace = useMemo(
      () =>
         adjustShipsToPlace(placedShips, {
            carrier: game.carriers,
            battleship: game.battleships,
            cruiser: game.cruisers,
            submarine: game.submarines,
            destroyer: game.destroyers,
         }),
      [game, placedShips]
   );

   const { orientation, setOrientation, toggleOrientation } = useOrientation();
   const [message, setMessage] = useState("");
   const resetHoveredCells = useCallback(() => {
      setHoveredCells({ canPlace: false, coordinates: [] });
   }, []);

   const { isReady, isOpponentReady, updateIsReady } = usePlayersReadyState(initialGame);

   useClearSelectionOnRelease({ draggingId, resetHoveredCells });

   async function removePlacedShip(ship: PlacedShip) {
      const newPlacedShips = placedShips.filter((ps) => ps.shipId !== ship.shipId);

      setPlacedShips([...newPlacedShips]);

      if (isReady) {
         updateIsReady(false);
      }
   }

   async function clearPlacedShips() {
      if (!hasHydrated) return;
      setPlacedShips([]);

      if (isReady) {
         updateIsReady(false);
      }
      await removePlayersShips({ playerId, gameId: game.id });
   }

   async function handleDragStart(e: DragStartEvent) {
      const shipId = String(e.active.id);
      setDraggingId(shipId);

      // Handle dragging a placed ship
      const placedShip = placedShips.find((ship) => ship.shipId === shipId);
      if (placedShip) {
         removePlacedShip(placedShip);
         setOrientation(placedShip.orientation);
      }
   }

   function handleDragAbortOrDragCancel() {
      resetHoveredCells();
      setDraggingId(null);
   }

   function placeShip({
      shipId,
      size,
      orientation,
      coordinates,
   }: {
      shipId: string;
      size: number;
      orientation: ShipOrientation;
      coordinates: Coordinates;
   }) {
      const shipType = shipId.split("-")[0] as ShipType;
      const newPlacedShips = placedShips.concat([
         { coordinates, size, orientation, shipId, shipType },
      ]);
      setPlacedShips(newPlacedShips);
      const newShipsToPlace = { ...shipsToPlace, [shipType]: shipsToPlace[shipType] - 1 };
      resetHoveredCells();

      const hasPlacedAllShips = checkIfHasPlacedAllShips(newShipsToPlace);
      if (hasPlacedAllShips) {
         setMessage("");
      }
   }

   function handleDragEnd(e: DragEndEvent) {
      setDraggingId(null);

      if (!hoveredCells.canPlace || !e.over) {
         resetHoveredCells();
         return;
      }

      const { size, orientation } = e.active.data.current as {
         size: number;
         orientation: ShipOrientation;
      };
      const [x, y] = String(e.over.id).split("-").map(Number);

      // Final verification if the ship can be placed!
      if (
         (orientation === "horizontal" && x + size > game.boardSize) ||
         (orientation === "vertical" && y + size > game.boardSize)
      ) {
         resetHoveredCells();
         return;
      }

      placeShip({ shipId: String(e.active.id), size, orientation, coordinates: { x, y } });
   }

   const highlightPlacement = useCallback(
      ({
         x,
         y,
         size,
         orientation,
      }: {
         x: number;
         y: number;
         size: number;
         orientation: ShipOrientation;
      }) => {
         const hoveredCells: HoveredCell[] = [];
         let canPlace = true;

         const isHorizontal = orientation === "horizontal";

         // Loop through the size of the ship in the correct direction
         for (let i = 0; i < size; i++) {
            const currentX = isHorizontal ? x + i : x;
            const currentY = isHorizontal ? y : y + i;

            if (currentX >= game.boardSize || currentY >= game.boardSize) {
               canPlace = false;
               break;
            }

            // Check if the cell is already occupied by another ship
            const isOccupied = allShipsCoordinates.has(`${currentX},${currentY}`);
            if (isOccupied) {
               canPlace = false;
            }

            hoveredCells.push({ x: currentX, y: currentY, isOccupied });
         }

         if (hoveredCells.length !== size) {
            canPlace = false;
         }

         if (!draggingId) {
            return resetHoveredCells();
         }

         setHoveredCells({ canPlace, coordinates: hoveredCells });
      },
      [allShipsCoordinates, draggingId, resetHoveredCells, game.boardSize]
   );

   const handleDragMove = useMemo(() => {
      return throttle((e: DragMoveEvent) => {
         if (!draggingId) return;
         const { id } = e.over ?? {};
         if (!id) {
            return resetHoveredCells();
         }
         // Get current coordinates from the droppable id
         const [x, y] = String(id).split("-").map(Number);

         // Get size and orientation from the droppable data
         const { size, orientation } = e.active.data.current as {
            size: number;
            orientation: ShipOrientation;
         };
         highlightPlacement({ x, y, size, orientation });
      }, 100);
   }, [draggingId, highlightPlacement, resetHoveredCells]);

   const hasPlacedAllShips = checkIfHasPlacedAllShips(shipsToPlace);

   async function handleSetReady() {
      if (!hasHydrated) return;
      if (hasPlacedAllShips && !isReady) {
         updateIsReady(true);
         await placeShips({ placedShips, playerId, gameId: game.id });
         return;
      }

      if (hasPlacedAllShips && isReady) {
         updateIsReady(false);
         return;
      }

      setMessage("Place all ships first!");
   }

   useEffect(() => () => handleDragMove.cancel(), [handleDragMove]);

   if (error) {
      return <p>{error}</p>;
   }

   return (
      <div className="p-4">
         <h1 className="mb-2 font-bold sm:text-2xl">Place Your Ships</h1>
         <DndContext
            id={id}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragAbort={handleDragAbortOrDragCancel}
            onDragCancel={handleDragAbortOrDragCancel}
            modifiers={[snapCenterToCursor]}
         >
            <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-[minmax(0,_3fr),minmax(0,_2fr)]">
               <ShipPlacementBoard
                  size={game.boardSize}
                  hoveredCells={hoveredCells}
                  placedShips={placedShips}
               />

               <section className="flex flex-col gap-4 sm:max-w-64">
                  <div className="flex w-full gap-1">
                     <div className="flex w-full flex-col gap-1">
                        <Button
                           variant="outline"
                           className="max-w-32 flex-1 capitalize"
                           onClick={toggleOrientation}
                        >
                           {orientation}
                           {orientation === "horizontal" ? (
                              <ArrowLeftRightIcon />
                           ) : (
                              <ArrowUpDownIcon />
                           )}
                        </Button>
                     </div>
                     <Button variant="outline" onClick={clearPlacedShips}>
                        Reset <RefreshCwIcon />
                     </Button>
                  </div>

                  <div>
                     <p className="text-sm">Drag and drop ships to the board.</p>
                     <p className="hidden text-sm sm:block">R / Right Click - Rotate Ship</p>
                  </div>
                  <ShipCatalogue
                     shipsToPlace={shipsToPlace}
                     orientation={orientation}
                     draggingId={draggingId}
                  />
                  <footer className="sticky bottom-0 w-full pb-4 sm:static sm:pb-0">
                     <div className="h-4 bg-gradient-to-t from-background via-background to-transparent sm:hidden"></div>

                     <div className="flex h-full flex-col gap-2 bg-background">
                        <Button
                           variant={isReady ? "green" : "default"}
                           className={cn("w-full", isReady && "animate-pulse")}
                           onClick={handleSetReady}
                           data-disabled={!hasPlacedAllShips}
                        >
                           {isReady ? "Ready" : "Click here when ready"}
                        </Button>
                        {message && <p className="text-sm text-red-500">{message}</p>}
                        {isOpponentReady ? (
                           <p className="text-sm">Opponent is ready!</p>
                        ) : (
                           <p className="animate-pulse text-sm">Waiting for opponent...</p>
                        )}
                     </div>
                  </footer>
               </section>
            </div>

            <DragOverlay dropAnimation={null}>
               {(Object.keys(shipsToPlace) as ShipType[]).map((shipType) => (
                  <Fragment key={shipType}>
                     {draggingId?.startsWith(shipType) && (
                        <Ship size={shipSizes[shipType]} orientation={orientation} />
                     )}
                  </Fragment>
               ))}
            </DragOverlay>
         </DndContext>
      </div>
   );
}
