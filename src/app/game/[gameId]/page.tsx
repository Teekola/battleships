"use client";

import {
   ComponentProps,
   Fragment,
   PropsWithChildren,
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
   useDraggable,
   useDroppable,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import debounce from "lodash.debounce";
import throttle from "lodash.throttle";

import { ShipType, shipSizes } from "@/app/create-game/create-game-form-schema";
import { Button } from "@/components/ui/button";
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

type PlacedShips = {
   id: string;
   shipType: ShipType;
   coordinates: Coordinates;
   size: number;
   orientation: ShipOrientation;
}[];

const emptyHoveredCells: HoveredCells = {
   canPlace: false,
   coordinates: [],
};

// TODO: MAKE PLACED SHIPS DRAGGABLE CORRECTLY!

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

function getAllShipsCoordinates({ placedShips }: { placedShips: PlacedShips }) {
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

type ShipAmounts = typeof shipSizes;

export default function GamePage() {
   const shipAmounts = {
      carrier: 1,
      battleship: 1,
      cruiser: 1,
      submarine: 1,
      destroyer: 2,
   };
   const gameBoardSize = 6;
   const id = useId();
   const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
   const [cellSize, setCellSize] = useState<number>(0);
   const [draggingId, setDraggingId] = useState<string | null>(null);
   const [placedShips, setPlacedShips] = useState<PlacedShips>([]);
   const [hoveredCells, setHoveredCells] = useState<HoveredCells>({
      canPlace: false,
      coordinates: [],
   });
   const [isDragging, setIsDragging] = useState(false);
   const [allShipsCoordinates, setAllShipsCoordinates] = useState(new Set<string>());

   const [shipsToPlace, setShipsToPlace] = useState<ShipAmounts>(shipAmounts);
   const [orientation, setOrientation] = useState<ShipOrientation>("vertical");

   useEffect(() => {
      function updateCellSize() {
         const dataCell = document.querySelector('[data-cell="true"]');
         if (!dataCell) return;
         const size = dataCell.getClientRects()[0].width;
         setCellSize(size);
      }
      updateCellSize();

      const debouncedUpdateCellSize = debounce(updateCellSize, 200);

      window.addEventListener("resize", debouncedUpdateCellSize);

      return () => {
         window.removeEventListener("resize", debouncedUpdateCellSize);
      };
   }, [gameBoardSize]);

   function handleDragStart(e: DragStartEvent) {
      const shipId = String(e.active.id);
      setDraggingId(shipId);

      // If the ship is in placed ships,
      // 1) remove it from placed ships
      // 2) reset allships coordinates
      // 3) update orientation to match its placement
      const placedShip = placedShips.find((ship) => ship.id === shipId);
      if (placedShip) {
         const newPlacedShips = placedShips.filter((ps) => ps.id !== shipId);
         const newShipsToPlace = {
            ...shipsToPlace,
            [placedShip.shipType]: shipsToPlace[placedShip.shipType] + 1,
         };
         setShipsToPlace(newShipsToPlace);
         setOrientation(placedShip.orientation);
         setPlacedShips(newPlacedShips);
         const newAllShipsCoordinates = getAllShipsCoordinates({ placedShips: newPlacedShips });
         setAllShipsCoordinates(newAllShipsCoordinates);
      }

      setIsDragging(true);
   }

   function handleDragAbort() {
      setHoveredCells(emptyHoveredCells);
      setDraggingId(null);
   }

   function handleDragCancel() {
      setHoveredCells(emptyHoveredCells);
      setDraggingId(null);
   }
   function handleDragEnd(e: DragEndEvent) {
      setIsDragging(false);
      console.log("END");
      setDraggingId(null);

      if (!hoveredCells.canPlace || !e.over) {
         setHoveredCells(emptyHoveredCells);
         return;
      }

      const shipId = String(e.active.id);
      const shipType = shipId.split("-")[0] as ShipType;
      const data = e.active.data.current;
      const size = data?.size as number;
      const orientation = data?.orientation as ShipOrientation;

      const [x, y] = String(e.over.id)
         .split("-")
         .map((s) => Number(s));

      const coordinates = { x, y };

      const newPlacedShips = placedShips.concat([
         { coordinates, size, orientation, id: shipId, shipType },
      ]);

      const newAllShipsCoordinates = getAllShipsCoordinates({ placedShips: newPlacedShips });

      const newShipsToPlace = { ...shipsToPlace, [shipType]: shipsToPlace[shipType] - 1 };
      setShipsToPlace(newShipsToPlace);
      setPlacedShips(newPlacedShips);
      setAllShipsCoordinates(newAllShipsCoordinates);
      setHoveredCells(emptyHoveredCells);
   }

   const handleDragMove = useMemo(() => {
      return throttle(
         (e: DragMoveEvent) => {
            if (!isDragging) return;
            const currentOver = e.over;

            if (!currentOver) {
               setHoveredCells(emptyHoveredCells);
               return;
            }

            // Get current coordinates from the droppable id
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
            if (!draggingId) {
               setHoveredCells(emptyHoveredCells);
               return;
            }
            setHoveredCells({ canPlace, coordinates: hoveredCells });
            console.log("MOVE");
         },
         100,
         { leading: true, trailing: true }
      );
   }, [allShipsCoordinates, draggingId, isDragging]);

   useEffect(() => {
      return () => {
         handleDragMove.cancel();
      };
   }, [handleDragMove]);

   // Ensure that if the move is fired after releasing, the selection is cleared
   useEffect(() => {
      let timeout: NodeJS.Timeout;
      if (!isDragging) {
         timeout = setTimeout(() => {
            console.log("REMOVE");
            setHoveredCells(emptyHoveredCells);
         }, 100);
      }
      return () => {
         clearTimeout(timeout);
      };
   }, [isDragging]);

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

            <DragOverlay dropAnimation={{ duration: 0 }}>
               {(Object.keys(shipsToPlace) as ShipType[]).map((shipType) => (
                  <Fragment key={shipType}>
                     {draggingId?.startsWith(shipType) && (
                        <Ship
                           boardSize={gameBoardSize}
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
   placedShips: PlacedShips;
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
               gap: 14 - size,
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
                     <Draggable
                        size={cell.shipSize}
                        orientation={cell.shipOrientation}
                        id={cell.shipId}
                     >
                        <ShipPiece
                           cellSize={cellSize}
                           shipPiece={cell.shipPiece as ShipPieceType}
                           orientation={cell.shipOrientation as ShipOrientation}
                        />
                     </Draggable>
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

function ShipCatalogueItem({ size }: Readonly<{ size: number }>) {
   return (
      <div className="flex items-center justify-between gap-1">
         {Array.from({ length: size }).map((v, i) => (
            <div
               key={i}
               className={cn(
                  "h-8 w-8 bg-slate-500",
                  "first-of-type:rounded-l-full last-of-type:rounded-r-full"
               )}
            ></div>
         ))}
      </div>
   );
}

function Ship({
   size,
   orientation,
   cellSize,
   boardSize,
}: Readonly<{ size: number; orientation: ShipOrientation; cellSize: number; boardSize: number }>) {
   return (
      <div
         style={{
            height:
               orientation === "horizontal"
                  ? cellSize
                  : size * cellSize + (size - 1) * (14 - boardSize),
            width:
               orientation === "horizontal"
                  ? size * cellSize + (size - 1) * (14 - boardSize)
                  : cellSize,
         }}
         className={cn(
            "flex gap-1",
            orientation === "horizontal" && "flex-row",
            orientation === "vertical" && "flex-col"
         )}
      >
         {Array.from({ length: size }).map((v, i) => (
            <div
               style={{
                  marginTop: orientation === "vertical" ? cellSize / 50 : 8,
                  marginBottom: orientation === "vertical" ? cellSize / 50 : 8,
                  marginRight: orientation === "horizontal" ? cellSize / 50 : 8,
                  marginLeft: orientation === "horizontal" ? cellSize / 50 : 8,
               }}
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
            paddingTop: orientation === "vertical" ? cellSize / 50 : 8,
            paddingBottom: orientation === "vertical" ? cellSize / 50 : 8,
            paddingRight: orientation === "horizontal" ? cellSize / 50 : 8,
            paddingLeft: orientation === "horizontal" ? cellSize / 50 : 8,
         }}
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
      <button
         ref={setNodeRef}
         style={style}
         {...listeners}
         {...attributes}
         className="block touch-none"
      >
         {children}
      </button>
   );
}

interface ShipCatalogueProps extends ComponentProps<"div"> {
   shipsToPlace: ShipAmounts;
   orientation: ShipOrientation;
   draggingId: string | null;
}

function ShipCatalogue({
   shipsToPlace,
   orientation,
   draggingId,
   ...props
}: Readonly<ShipCatalogueProps>) {
   const shouldDisplayGhost = (shipType: ShipType) => {
      return draggingId?.startsWith(shipType) || shipsToPlace[shipType] < 1;
   };

   return (
      <div {...props} className={cn("flex flex-col gap-2", props.className && props.className)}>
         {(Object.keys(shipsToPlace) as ShipType[]).map((shipType) => (
            <div key={shipType} className="relative">
               {shipsToPlace[shipType] > 0 && (
                  <Draggable
                     key={shipType}
                     size={shipSizes[shipType]}
                     orientation={orientation}
                     id={`${shipType}-${shipsToPlace[shipType]}`}
                  >
                     {!draggingId?.startsWith(shipType) && (
                        <ShipCatalogueItem size={shipSizes[shipType]} />
                     )}
                  </Draggable>
               )}
               <div
                  className={cn(
                     "absolute left-0 top-0 -z-10",
                     shipsToPlace[shipType] < 1 && "opacity-50",
                     shipsToPlace[shipType] === 1 && draggingId && "opacity-50"
                  )}
               >
                  <ShipCatalogueItem size={shipSizes[shipType]} />
               </div>
               {shouldDisplayGhost(shipType) && <div className="h-8"></div>}
            </div>
         ))}
      </div>
   );
}
