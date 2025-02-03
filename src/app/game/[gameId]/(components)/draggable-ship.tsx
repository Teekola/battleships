import { ComponentProps, PropsWithChildren, useId } from "react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

interface DraggableShipProps extends ComponentProps<"button"> {
   size: number;
   orientation: "horizontal" | "vertical";
   id?: string;
}

export function DraggableShip({
   children,
   size,
   orientation,
   id,
   ...props
}: Readonly<PropsWithChildren<DraggableShipProps>>) {
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
         {...props}
         ref={setNodeRef}
         style={{ ...style, ...(props.style && props.style) }}
         {...listeners}
         {...attributes}
         className={cn("block h-full w-full touch-none", props.className && props.className)}
      >
         {children}
      </button>
   );
}
