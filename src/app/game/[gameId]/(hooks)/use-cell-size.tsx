import { useEffect, useMemo, useState } from "react";

import debounce from "lodash.debounce";

export function useCellSize() {
   const [cellSize, setCellSize] = useState<number>(16);

   const updateCellSize = useMemo(
      () =>
         debounce(
            () => {
               const dataCell = document.querySelector('[data-cell="true"]');
               if (dataCell) {
                  setCellSize(dataCell.getClientRects()[0]?.width);
               }
            },
            300,
            { leading: true }
         ),
      []
   );

   useEffect(() => {
      updateCellSize();
      window.addEventListener("resize", updateCellSize);

      return () => {
         window.removeEventListener("resize", updateCellSize);
         updateCellSize.cancel();
      };
   }, [updateCellSize]);

   return cellSize;
}
