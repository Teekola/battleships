"use client";

import { PropsWithChildren, useEffect, useId, useState } from "react";

import {
   DndContext,
   DragEndEvent,
   DragMoveEvent,
   DragOverlay,
   DragStartEvent,
   KeyboardSensor,
   PointerSensor,
   useDraggable,
   useDroppable,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

interface Coordinates {
   x: number;
   y: number;
}
type ShipPieceType = "start" | "mid" | "end";
type ShipOrientation = "horizontal" | "vertical";

type BoardWithShips = BoardCell[][];
type BoardCell =
   | {
        x: number;
        y: number;
        isShip: true;
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

type PlacedShips = {
   coordinates: Coordinates;
   size: number;
   orientation: ShipOrientation;
}[];

const emptyHoveredCells: HoveredCells = {
   canPlace: false,
   coordinates: [],
};

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

function placeShipsOnGameBoard(ships: PlacedShips, board: BoardWithShips) {
   ships.forEach(({ coordinates, orientation, size }) => {
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
               shipOrientation: orientation,
               shipPiece,
            };
         } else {
            board[y + i][x] = {
               x,
               y: y + i,
               isShip: true,
               shipOrientation: orientation,
               shipPiece,
            };
         }
      }
   });
}

export default function GamePage() {
   const id = useId();
   const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
   const gameBoardSize = 10;
   const [gridSize, setGridSize] = useState<number>(0);
   const [draggingId, setDraggingId] = useState<string | null>(null);
   const [placedShips, setPlacedShips] = useState<PlacedShips>([]);
   const [hoveredCells, setHoveredCells] = useState<HoveredCells>({
      canPlace: false,
      coordinates: [],
   });
   const [allShipsCoordinates, setAllShipsCoordinates] = useState(new Set<string>());

   // Update grid size
   useEffect(() => {
      const dataCell = document.querySelector('[data-cell="true"]');
      if (!dataCell) return;
      const size = dataCell.getClientRects()[0].width;
      setGridSize(size);

      // TODO: Add event listener to resize
   }, []);

   function handleDragStart(e: DragStartEvent) {
      setDraggingId(e.active.id + "");
   }

   function handleDragEnd(e: DragEndEvent) {
      setDraggingId(null);

      if (!hoveredCells.canPlace || !e.over) {
         setHoveredCells(emptyHoveredCells);
         return;
      }

      const data = e.active.data.current;
      const size = data?.size as number;
      const orientation = data?.orientation as ShipOrientation;

      const [x, y] = String(e.over.id)
         .split("-")
         .map((s) => Number(s));

      const coordinates = { x, y };

      const newPlacedShips = placedShips.concat([{ coordinates, size, orientation }]);

      const newAllShipsCoordinates = new Set<string>();
      for (const { orientation, size, coordinates } of newPlacedShips) {
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
      setPlacedShips(newPlacedShips);
      setAllShipsCoordinates(newAllShipsCoordinates);
      setHoveredCells(emptyHoveredCells);
   }

   function handleDragMove(e: DragMoveEvent) {
      const currentOver = e.over;

      if (!currentOver) {
         setHoveredCells(emptyHoveredCells);
         return;
      }

      // get current coordinates from the droppable id
      const [x, y] = String(currentOver.id)
         .split("-")
         .map((s) => Number(s));

      // Get size and orientation from the droppable data
      const data = e.active.data.current;
      const size = data?.size as number;
      const orientation = data?.orientation as string;

      // Calculate the hovered cells
      const hoveredCells: HoveredCell[] = [];

      let canPlace = true;

      // Check for horizontal placement
      if (orientation === "horizontal") {
         for (let i = 0; i < size; i++) {
            if (x + i >= gameBoardSize) {
               break;
            }

            // Check if this cell is occupied by any ship part
            const isOccupied = allShipsCoordinates.has(`${x + i},${y}`);

            if (isOccupied) {
               canPlace = false;
            }

            hoveredCells.push({ x: x + i, y, isOccupied });
         }
      }

      // Check for vertical placement
      if (orientation === "vertical") {
         for (let i = 0; i < size; i++) {
            if (y + i >= gameBoardSize) {
               break;
            }

            const isOccupied = allShipsCoordinates.has(`${x},${y + i}`);

            if (isOccupied) {
               canPlace = false;
            }

            hoveredCells.push({ x, y: y + i, isOccupied });
         }
      }

      if (hoveredCells.length !== size) {
         canPlace = false;
      }
      setHoveredCells({ canPlace, coordinates: hoveredCells });
   }

   return (
      <div className="h-full">
         <DndContext
            id={id}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
         >
            <GameBoard
               size={gameBoardSize}
               hoveredCells={hoveredCells}
               placedShips={placedShips}
               cellSize={gridSize}
            />
            <ShipCatalogue>
               <Draggable size={2} orientation="horizontal" id="2">
                  <Ship size={2} gridSize={gridSize} orientation="horizontal" />
               </Draggable>
               <Draggable size={4} orientation="vertical" id="4">
                  <Ship size={4} gridSize={gridSize} orientation="vertical" />
               </Draggable>
               <Draggable size={5} orientation="horizontal" id="5">
                  <Ship size={5} gridSize={gridSize} orientation="horizontal" />
               </Draggable>
            </ShipCatalogue>
            <DragOverlay>
               {draggingId === "2" && (
                  <Ship size={2} gridSize={gridSize} orientation="horizontal" />
               )}
               {draggingId === "4" && <Ship size={4} gridSize={gridSize} orientation="vertical" />}
               {draggingId === "5" && (
                  <Ship size={5} gridSize={gridSize} orientation="horizontal" />
               )}
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
   placedShips: PlacedShips;
   cellSize: number;
}>) {
   const board = generateGameBoard(size);
   placeShipsOnGameBoard(placedShips, board);

   return (
      <div className="max-h-lg aspect-square max-w-lg">
         <div
            className="grid h-full w-full gap-1 bg-blue-950"
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
                     <ShipPiece
                        cellSize={cellSize}
                        shipPiece={cell.shipPiece as ShipPieceType}
                        orientation={cell.shipOrientation as ShipOrientation}
                     />
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
   const { isOver, setNodeRef } = useDroppable({
      id: coordinates.x + "-" + coordinates.y,
   });

   return (
      <div
         data-cell="true"
         ref={setNodeRef}
         className={cn(
            "group flex h-full w-full cursor-pointer items-center justify-center",
            (isOver || isShipOver) && canPlace && "bg-blue-200",
            (isOver || isShipOver) && !canPlace && "bg-red-300"
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
   gridSize,
}: Readonly<{ size: number; orientation: ShipOrientation; gridSize: number }>) {
   return (
      <div
         style={{
            height: orientation === "horizontal" ? gridSize : size * gridSize,
            width: orientation === "horizontal" ? size * gridSize : gridSize,
         }}
         className={cn(
            "flex gap-1 p-2",
            orientation === "horizontal" && "flex-row",
            orientation === "vertical" && "flex-col"
         )}
      >
         {Array.from({ length: size }).map((v, i) => (
            <div
               key={i}
               className={cn(
                  "h-full w-full bg-slate-500",
                  orientation === "horizontal" &&
                     "first-of-type:rounded-l-full last-of-type:rounded-r-full",
                  orientation === "vertical" &&
                     "first-of-type:rounded-t-full last-of-type:rounded-b-full"
               )}
            ></div>
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
         }}
         className={cn(
            orientation === "horizontal" && "px-[1px] py-2",
            orientation === "vertical" && "px-2 py-[1px]"
         )}
      >
         <div
            className={cn(
               "h-full w-full bg-slate-500",
               orientation === "horizontal" && shipPiece === "start" && "rounded-l-full",
               orientation === "horizontal" && shipPiece === "end" && "rounded-r-full",
               orientation === "vertical" && shipPiece === "start" && "rounded-t-full",
               orientation === "vertical" && shipPiece === "end" && "rounded-b-full"
            )}
         ></div>
      </div>
   );
}

function Draggable({
   children,
   size,
   orientation,
   id,
}: Readonly<
   PropsWithChildren<{ size: number; orientation: "horizontal" | "vertical"; id?: string }>
>) {
   const uniqueId = useId();
   const draggableId = id ?? uniqueId;
   const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: draggableId,
      data: { size, orientation },
   });
   const style = {
      transform: CSS.Translate.toString(transform),
   };

   return (
      <button ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
         {children}
      </button>
   );
}

function ShipCatalogue({ children }: PropsWithChildren) {
   return <div>{children}</div>;
}
