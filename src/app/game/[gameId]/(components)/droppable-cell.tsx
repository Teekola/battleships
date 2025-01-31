import { PropsWithChildren } from "react";

import { useDroppable } from "@dnd-kit/core";
import { Coordinates } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

export function DroppableCell({
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
