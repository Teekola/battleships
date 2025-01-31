import { useEffect } from "react";

export function useClearSelectionOnRelease({
   draggingId,
   resetHoveredCells,
}: Readonly<{ draggingId: string | null; resetHoveredCells: () => void }>) {
   useEffect(() => {
      let timeout: NodeJS.Timeout;
      if (!draggingId) {
         timeout = setTimeout(() => {
            resetHoveredCells();
         }, 100);
      }

      return () => {
         clearTimeout(timeout);
      };
   }, [draggingId, resetHoveredCells]);
}
