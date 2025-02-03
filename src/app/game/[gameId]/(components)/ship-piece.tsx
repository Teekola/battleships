import { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { ShipOrientation, ShipPieceType } from "../(utils)/types";

function getStyle({
   orientation,
   cellSize,
   shipPiece,
}: {
   orientation: ShipOrientation;
   cellSize?: number;
   shipPiece: ShipPieceType;
}) {
   const lengthPadding = cellSize ? cellSize * 0.1 : "10%";
   const widthPadding = cellSize ? cellSize * 0.15 : "15%";

   const baseStyle: CSSProperties = {
      width: cellSize ?? "100%",
      height: cellSize ?? "100%",
   };
   const paddingStyles: CSSProperties =
      orientation === "horizontal"
         ? {
              paddingLeft: shipPiece === "start" ? lengthPadding : 0,
              paddingRight: shipPiece === "end" ? lengthPadding : 0,
              paddingTop: widthPadding,
              paddingBottom: widthPadding,
           }
         : {
              paddingTop: shipPiece === "start" ? lengthPadding : 0,
              paddingBottom: shipPiece === "end" ? lengthPadding : 0,
              paddingRight: widthPadding,
              paddingLeft: widthPadding,
           };
   return { ...baseStyle, ...paddingStyles };
}

export function ShipPiece({
   cellSize,
   orientation,
   shipPiece,
   isSunk = false,
}: Readonly<{
   cellSize?: number;
   orientation: ShipOrientation;
   shipPiece: ShipPieceType;
   isSunk?: boolean;
}>) {
   return (
      <div style={getStyle({ cellSize, orientation, shipPiece })}>
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
                  "border-b-4 border-t-4 border-slate-700",
               isSunk && "border-red-950/30 bg-red-900/30 transition-colors duration-1000"
            )}
         ></div>
      </div>
   );
}
