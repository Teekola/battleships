"use client";

import {
   Fragment,
   PropsWithChildren,
   useCallback,
   useEffect,
   useId,
   useMemo,
   useState,
} from "react";

import {
   DndContext,
   DragEndEvent,
   DragMoveEvent,
   DragOverlay,
   DragStartEvent,
   KeyboardSensor,
   PointerSensor,
   useDroppable,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import throttle from "lodash.throttle";

import { ShipType, shipSizes } from "@/app/create-game/create-game-form-schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DraggableShip } from "./(components)/draggable-ship";
import { ShipCatalogue } from "./(components)/ship-catalogue";

export interface Coordinates {
   x: number;
   y: number;
}
export type ShipPieceType = "start" | "mid" | "end";
export type ShipOrientation = "horizontal" | "vertical";

type BoardWithShips = BoardCell[][];
type BoardCell =
   | {
        x: number;
        y: number;
        isShip: true;
        shipId: string;
        shipSize: number;
        shipOrientation: ShipOrientation;
        shipPiece: ShipPieceType;
     }
   | { x: number; y: number; isShip: false };

type HoveredCells = {
   canPlace: boolean;
   coordinates: HoveredCell[];
};

interface HoveredCell extends Coordinates {
   isOccupied: boolean;
}

type PlacedShip = {
   id: string;
   shipType: ShipType;
   coordinates: Coordinates;
   size: number;
   orientation: ShipOrientation;
};

export type ShipAmounts = typeof shipSizes;

function generateGameBoard(size: number): BoardWithShips {
   const board: BoardWithShips = [];
   for (let y = 0; y < size; y++) {
      const row: BoardCell[] = [];
      for (let x = 0; x < size; x++) {
         row.push({ x, y, isShip: false });
      }
      board.push(row);
   }
   return board;
}

function placeShipsOnGameBoard(ships: PlacedShip[], board: BoardWithShips) {
   ships.forEach(({ coordinates, orientation, size, id }) => {
      const { x, y } = coordinates;
      for (let i = 0; i < size; i++) {
         const isStart = i === 0;
         const isEnd = i === size - 1;
         const shipPiece = isStart ? "start" : isEnd ? "end" : "mid";

         if (orientation === "horizontal") {
            board[y][x + i] = {
               x: x + i,
               y,
               isShip: true,
               shipId: id,
               shipSize: size,
               shipOrientation: orientation,
               shipPiece,
            };
         } else {
            board[y + i][x] = {
               x,
               y: y + i,
               isShip: true,
               shipId: id,
               shipSize: size,
               shipOrientation: orientation,
               shipPiece,
            };
         }
      }
   });
}

function getAllShipsCoordinates({ placedShips }: { placedShips: PlacedShip[] }) {
   const newAllShipsCoordinates = new Set<string>();
   for (const { orientation, size, coordinates } of placedShips) {
      if (orientation === "horizontal") {
         for (let i = 0; i < size; i++) {
            newAllShipsCoordinates.add(`${coordinates.x + i},${coordinates.y}`);
         }
      } else if (orientation === "vertical") {
         for (let i = 0; i < size; i++) {
            newAllShipsCoordinates.add(`${coordinates.x},${coordinates.y + i}`);
         }
      }
   }
   return newAllShipsCoordinates;
}

const useCellSize = (gameBoardSize: number) => {
   const [cellSize, setCellSize] = useState<number>(gameBoardSize * 16);

   useEffect(() => {
      const updateCellSize = throttle(() => {
         const dataCell = document.querySelector('[data-cell="true"]');
         if (dataCell) {
            setCellSize(dataCell.getClientRects()[0].width);
         }
      }, 300);

      updateCellSize();
      window.addEventListener("resize", updateCellSize);

      return () => window.removeEventListener("resize", updateCellSize);
   }, [gameBoardSize]);

   return cellSize;
};

function useClearSelectionOnRelease({
   draggingId,
   resetHoveredCells,
}: Readonly<{ draggingId: string | null; resetHoveredCells: () => void }>) {
   useEffect(() => {
      let timeout: NodeJS.Timeout;
      if (!draggingId) {
         timeout = setTimeout(() => {
            console.log("REMOVE");
            resetHoveredCells();
         }, 100);
      }

      return () => {
         clearTimeout(timeout);
      };
   }, [draggingId, resetHoveredCells]);
}

export default function GamePage() {
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

   useClearSelectionOnRelease({ draggingId, resetHoveredCells });
   function removePlacedShip(ship: PlacedShip) {
      const newPlacedShips = placedShips.filter((ps) => ps.id !== ship.id);
      const newShipsToPlace = {
         ...shipsToPlace,
         [ship.shipType]: shipsToPlace[ship.shipType] + 1,
      };
      setShipsToPlace(newShipsToPlace);
      setPlacedShips(newPlacedShips);
      updateAllShipsCoordinates();
   }

   function resetHoveredCells() {
      setHoveredCells({ canPlace: false, coordinates: [] });
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
      updateAllShipsCoordinates();
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
      [allShipsCoordinates, draggingId]
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
   }, [draggingId, highlightPlacement]);

   useEffect(() => () => handleDragMove.cancel(), [handleDragMove]);

   function updateAllShipsCoordinates() {
      setAllShipsCoordinates(getAllShipsCoordinates({ placedShips }));
   }

   return (
      <div className="h-full">
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
            <GameBoard
               size={gameBoardSize}
               hoveredCells={hoveredCells}
               placedShips={placedShips}
               cellSize={cellSize}
            />

            <div>
               <Button
                  onClick={() =>
                     setOrientation((prev) => (prev === "horizontal" ? "vertical" : "horizontal"))
                  }
               >
                  {orientation}
               </Button>
            </div>
            <ShipCatalogue
               shipsToPlace={shipsToPlace}
               orientation={orientation}
               draggingId={draggingId}
            />

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

function GameBoard({
   size,
   cellSize,
   hoveredCells,
   placedShips,
}: Readonly<{
   size: number;
   hoveredCells: HoveredCells;
   placedShips: PlacedShip[];
   cellSize: number;
}>) {
   const board = generateGameBoard(size);
   placeShipsOnGameBoard(placedShips, board);

   return (
      <div className="max-h-lg aspect-square max-w-lg">
         <div
            className="grid h-full w-full bg-blue-950"
            style={{
               gridTemplateColumns: `repeat(${size}, 1fr)`,
               gridTemplateRows: `repeat(${size}, 1fr)`,
            }}
         >
            {board.flat().map((cell) => (
               <DroppableCell
                  key={`${cell.x}-${cell.y}`}
                  coordinates={{ x: cell.x, y: cell.y }}
                  isShip={cell.isShip}
                  canPlace={hoveredCells.canPlace && !cell.isShip}
                  isShipOver={hoveredCells.coordinates.some(
                     (hoveredCell) => cell.x === hoveredCell.x && cell.y === hoveredCell.y
                  )}
               >
                  {cell.isShip && (
                     <DraggableShip
                        size={cell.shipSize}
                        orientation={cell.shipOrientation}
                        id={cell.shipId}
                     >
                        <ShipPiece
                           cellSize={cellSize}
                           shipPiece={cell.shipPiece}
                           orientation={cell.shipOrientation}
                        />
                     </DraggableShip>
                  )}
               </DroppableCell>
            ))}
         </div>
      </div>
   );
}

function DroppableCell({
   coordinates,
   canPlace = false,
   children,
   isShipOver = false,
   isShip = false,
}: Readonly<
   PropsWithChildren<{
      coordinates: Coordinates;
      isShipOver?: boolean;
      canPlace?: boolean;
      isShip?: boolean;
   }>
>) {
   const { setNodeRef } = useDroppable({
      id: coordinates.x + "-" + coordinates.y,
   });

   return (
      <div
         data-cell="true"
         ref={setNodeRef}
         className={cn(
            "group flex h-full w-full cursor-pointer items-center justify-center",
            isShipOver && canPlace && "bg-blue-200",
            isShipOver && !canPlace && "bg-red-300"
         )}
      >
         {isShip && children}
         {!isShip && (
            <div className="h-1/4 w-1/4 rounded-full bg-blue-300 group-hover:bg-blue-500"></div>
         )}
      </div>
   );
}

function Ship({
   size,
   orientation,
   cellSize,
}: Readonly<{ size: number; orientation: ShipOrientation; cellSize: number }>) {
   return (
      <div
         style={{
            height: orientation === "horizontal" ? cellSize : size * cellSize,
            width: orientation === "horizontal" ? size * cellSize : cellSize,
            display: "flex",
            flexDirection: orientation === "horizontal" ? "row" : "column",
         }}
      >
         {Array.from({ length: size }).map((_, i) => (
            <ShipPiece
               key={i}
               cellSize={cellSize}
               orientation={orientation}
               shipPiece={i === 0 ? "start" : i === size - 1 ? "end" : "mid"}
            />
         ))}
      </div>
   );
}

function ShipPiece({
   cellSize,
   orientation,
   shipPiece,
}: Readonly<{ cellSize: number; orientation: ShipOrientation; shipPiece: ShipPieceType }>) {
   return (
      <div
         style={{
            height: cellSize,
            width: cellSize,
            paddingLeft:
               orientation === "horizontal" ? (shipPiece === "start" ? cellSize / 10 : 0) : 5,
            paddingRight:
               orientation === "horizontal" ? (shipPiece === "end" ? cellSize / 10 : 0) : 5,
            paddingTop:
               orientation === "vertical" ? (shipPiece === "start" ? cellSize / 10 : 0) : 5,
            paddingBottom:
               orientation === "vertical" ? (shipPiece === "end" ? cellSize / 10 : 0) : 5,
         }}
      >
         <div
            className={cn(
               "h-full w-full bg-slate-500",
               orientation === "horizontal" &&
                  shipPiece === "start" &&
                  "rounded-l-full border-r-4 border-slate-700",
               orientation === "horizontal" &&
                  shipPiece === "end" &&
                  "rounded-r-full border-l-4 border-slate-700",
               orientation === "horizontal" &&
                  shipPiece === "mid" &&
                  "border-l-4 border-r-4 border-slate-700",
               orientation === "vertical" &&
                  shipPiece === "start" &&
                  "rounded-t-full border-b-4 border-slate-700",
               orientation === "vertical" &&
                  shipPiece === "end" &&
                  "rounded-b-full border-t-4 border-slate-700",
               orientation === "vertical" &&
                  shipPiece === "mid" &&
                  "border-b-4 border-t-4 border-slate-700"
            )}
         ></div>
      </div>
   );
}
