import { useEffect, useState } from "react";

import throttle from "lodash.throttle";

export function useCellSize(gameBoardSize: number) {
   const [cellSize, setCellSize] = useState<number>(gameBoardSize * 16);

   useEffect(() => {
      const updateCellSize = throttle(() => {
         const dataCell = document.querySelector('[data-cell="true"]');
         if (dataCell) {
            setCellSize(dataCell.getClientRects()[0].width);
         }
      }, 300);

      updateCellSize();
      window.addEventListener("resize", updateCellSize);

      return () => window.removeEventListener("resize", updateCellSize);
   }, [gameBoardSize]);

   return cellSize;
}
