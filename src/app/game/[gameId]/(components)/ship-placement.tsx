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
import { ArrowLeftRightIcon, ArrowUpDownIcon } from "lucide-react";

import { ShipType, shipSizes } from "@/app/create-game/create-game-form-schema";
import { Button } from "@/components/ui/button";

import { useCellSize } from "../(hooks)/use-cell-size";
import { useClearSelectionOnRelease } from "../(hooks)/use-clear-selection-on-resize";
import { getAllShipsCoordinates } from "../(utils)/get-all-ships-coordinates";
import {
   HoveredCell,
   HoveredCells,
   PlacedShip,
   ShipAmounts,
   ShipOrientation,
} from "../(utils)/types";
import { GameBoard } from "./game-board";
import { Ship } from "./ship";
import { ShipCatalogue } from "./ship-catalogue";

export function ShipPlacement() {
   const shipAmounts = {
      carrier: 1,
      battleship: 1,
      cruiser: 1,
      submarine: 1,
      destroyer: 2,
   };
   const gameBoardSize = 6;
   const cellSize = useCellSize(gameBoardSize);
   const id = useId();
   const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
   const [draggingId, setDraggingId] = useState<string | null>(null);
   const [placedShips, setPlacedShips] = useState<PlacedShip[]>([]);
   const [hoveredCells, setHoveredCells] = useState<HoveredCells>({
      canPlace: false,
      coordinates: [],
   });
   const [allShipsCoordinates, setAllShipsCoordinates] = useState(new Set<string>());
   const [shipsToPlace, setShipsToPlace] = useState<ShipAmounts>(shipAmounts);
   const [orientation, setOrientation] = useState<ShipOrientation>("vertical");

   const resetHoveredCells = useCallback(() => {
      setHoveredCells({ canPlace: false, coordinates: [] });
   }, []);

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

            if (currentX >= gameBoardSize || currentY >= gameBoardSize) {
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
      [allShipsCoordinates, draggingId, resetHoveredCells]
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

   useEffect(() => () => handleDragMove.cancel(), [handleDragMove]);

   return (
      <div>
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
            <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
               <GameBoard
                  size={gameBoardSize}
                  hoveredCells={hoveredCells}
                  placedShips={placedShips}
                  cellSize={cellSize}
               />

               <section className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                     <p>Ship direction:</p>

                     <Button
                        className="max-w-32 capitalize"
                        onClick={() =>
                           setOrientation((prev) =>
                              prev === "horizontal" ? "vertical" : "horizontal"
                           )
                        }
                     >
                        {orientation}
                        {orientation === "horizontal" ? (
                           <ArrowLeftRightIcon />
                        ) : (
                           <ArrowUpDownIcon />
                        )}
                     </Button>
                  </div>

                  <ShipCatalogue
                     shipsToPlace={shipsToPlace}
                     orientation={orientation}
                     draggingId={draggingId}
                  />
               </section>
            </div>

            <DragOverlay dropAnimation={null}>
               {(Object.keys(shipsToPlace) as ShipType[]).map((shipType) => (
                  <Fragment key={shipType}>
                     {draggingId?.startsWith(shipType) && (
                        <Ship
                           size={shipSizes[shipType]}
                           orientation={orientation}
                           cellSize={cellSize}
                        />
                     )}
                  </Fragment>
               ))}
            </DragOverlay>
         </DndContext>
      </div>
   );
}
