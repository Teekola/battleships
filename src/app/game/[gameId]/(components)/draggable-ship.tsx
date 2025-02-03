import { PropsWithChildren, useId } from "react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function DraggableShip({
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
         className="block h-full w-full touch-none"
      >
         {children}
      </button>
   );
}
