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
import { placeShips } from "./actions";
import { Ship } from "./ship";
import { ShipCatalogue } from "./ship-catalogue";
import { ShipPlacementBoard } from "./ship-placement-board";

function checkIfHasPlacedAllShips(shipsToPlace: ShipAmounts) {
   return Object.keys(shipsToPlace).every((key) => shipsToPlace[key as ShipType] < 1);
}

function adjustShipsToPlace(
   placedShips: PlacedShip[],
   initialShipsToPlace: Record<string, number>
): Record<string, number> {
   // Count occurrences of each ship type in placedShips
   const placedShipCounts = placedShips.reduce(
      (acc, ship) => {
         const key = ship.shipType.toLowerCase(); // Convert enum to lowercase to match `initialShipsToPlace`
         acc[key] = (acc[key] || 0) + 1;
         return acc;
      },
      {} as Record<string, number>
   );

   // Reduce counts in initialShipsToPlace
   const updatedShipsToPlace = { ...initialShipsToPlace };

   Object.keys(placedShipCounts).forEach((shipType) => {
      if (updatedShipsToPlace[shipType] !== undefined) {
         updatedShipsToPlace[shipType] = Math.max(
            0,
            updatedShipsToPlace[shipType] - placedShipCounts[shipType]
         );
      }
   });

   return updatedShipsToPlace;
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
   const { game, error } = useGame(initialGame);
   const { playerId } = usePlayer();

   const id = useId();
   const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
   const [draggingId, setDraggingId] = useState<string | null>(null);

   const [placedShips, setPlacedShips] = useState<PlacedShip[]>(
      convertPlacedShipsDBTToPlacedShip(
         playerId === game.player1Id ? initialPlayer1PlacedShips : initialPlayer2PlacedShips
      )
   );

   const initialShipsToPlace = {
      carrier: game.carriers,
      battleship: game.battleships,
      cruiser: game.cruisers,
      submarine: game.submarines,
      destroyer: game.destroyers,
   };

   adjustShipsToPlace(placedShips, initialShipsToPlace);

   const [hoveredCells, setHoveredCells] = useState<HoveredCells>({
      canPlace: false,
      coordinates: [],
   });
   const [allShipsCoordinates, setAllShipsCoordinates] = useState(new Set<string>());
   const [shipsToPlace, setShipsToPlace] = useState<ShipAmounts>(initialShipsToPlace);
   const { orientation, setOrientation, toggleOrientation } = useOrientation();
   const [message, setMessage] = useState("");
   const resetHoveredCells = useCallback(() => {
      setHoveredCells({ canPlace: false, coordinates: [] });
   }, []);

   const { isReady, isOpponentReady, updateIsReady } = usePlayersReadyState(initialGame);

   useClearSelectionOnRelease({ draggingId, resetHoveredCells });

   function removePlacedShip(ship: PlacedShip) {
      const newPlacedShips = placedShips.filter((ps) => ps.id !== ship.id);
      const newShipsToPlace = {
         ...shipsToPlace,
         [ship.shipType]: shipsToPlace[ship.shipType] + 1,
      };
      setShipsToPlace(newShipsToPlace);
      setPlacedShips(newPlacedShips);
      setAllShipsCoordinates(getAllShipsCoordinates({ placedShips: newPlacedShips }));
      if (isReady) {
         updateIsReady(false);
      }
   }

   function clearPlacedShips() {
      setPlacedShips([]);
      setShipsToPlace(initialShipsToPlace);
      setAllShipsCoordinates(new Set());
      if (isReady) {
         updateIsReady(false);
      }
   }

   function handleDragStart(e: DragStartEvent) {
      const shipId = String(e.active.id);
      setDraggingId(shipId);

      // Handle dragging a placed ship
      const placedShip = placedShips.find((ship) => ship.id === shipId);
      if (placedShip) {
         removePlacedShip(placedShip);
         setOrientation(placedShip.orientation);
      }
   }

   function handleDragAbort() {
      resetHoveredCells();
      setDraggingId(null);
   }

   function handleDragCancel() {
      resetHoveredCells();
      setDraggingId(null);
   }

   function placeShip({
      id,
      size,
      orientation,
      coordinates,
   }: {
      id: string;
      size: number;
      orientation: ShipOrientation;
      coordinates: Coordinates;
   }) {
      const shipType = id.split("-")[0] as ShipType;
      const newPlacedShips = placedShips.concat([{ coordinates, size, orientation, id, shipType }]);
      setPlacedShips(newPlacedShips);
      setAllShipsCoordinates(getAllShipsCoordinates({ placedShips: newPlacedShips }));
      const newShipsToPlace = { ...shipsToPlace, [shipType]: shipsToPlace[shipType] - 1 };
      setShipsToPlace(newShipsToPlace);
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

      placeShip({ id: String(e.active.id), size, orientation, coordinates: { x, y } });
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
      return throttle(
         (e: DragMoveEvent) => {
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
         },
         100,
         { leading: true, trailing: true }
      );
   }, [draggingId, highlightPlacement, resetHoveredCells]);

   const hasPlacedAllShips = checkIfHasPlacedAllShips(shipsToPlace);

   async function handleSetReady() {
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
         <h1 className="text-2xl font-bold">Place Your Ships</h1>
         <DndContext
            id={id}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragAbort={handleDragAbort}
            onDragCancel={handleDragCancel}
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
