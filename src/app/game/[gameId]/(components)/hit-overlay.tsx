import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Coordinates } from "../(utils)/types";

export function HitOverlay({ isShip }: { isShip: boolean }) {
   const ref = useRef<HTMLDivElement | null>(null);
   const [offsets, setOffsets] = useState<Coordinates>({ x: 0, y: 0 });

   // Calculate the distance from the element to the top-left corner of the viewport
   useEffect(() => {
      if (ref.current) {
         const rect = ref.current.getBoundingClientRect();
         const offsetX = rect.left;
         const offsetY = rect.top;
         setOffsets({ x: offsetX, y: offsetY });
      }
   }, []);

   return (
      <div
         style={
            {
               "--hit-offset-x": `-${offsets.x}px`,
               "--hit-offset-y": `-${offsets.y}px`,
            } as React.CSSProperties
         }
         ref={ref}
         className={cn(
            "absolute left-1/2 top-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white",
            isShip && "bg-red-500",
            offsets.x === 0 && "opacity-0",
            offsets.x !== 0 && "animate-hit"
         )}
      ></div>
   );
}
