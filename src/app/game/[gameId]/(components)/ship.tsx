import { ShipOrientation } from "../(utils)/types";
import { ShipPiece } from "./ship-piece";

export function Ship({
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
