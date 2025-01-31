import { cn } from "@/lib/utils";

import { ShipOrientation, ShipPieceType } from "../(utils)/types";

export function ShipPiece({
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
