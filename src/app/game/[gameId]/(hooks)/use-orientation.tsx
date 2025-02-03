import { useCallback, useEffect, useState } from "react";

import { ShipOrientation } from "../(utils)/types";

export function useOrientation() {
   const [orientation, setOrientation] = useState<ShipOrientation>("horizontal");

   const toggleOrientation = useCallback(() => {
      setOrientation((prev) => (prev === "horizontal" ? "vertical" : "horizontal"));
   }, []);
   useEffect(() => {
      function toggleOrientationWithR(e: KeyboardEvent) {
         if (e.key === "r") {
            toggleOrientation();
         }
      }

      function toggleOrientationWithRightClick(e: MouseEvent) {
         if (e.button === 2) {
            toggleOrientation();
         }
      }

      document.addEventListener("keydown", toggleOrientationWithR);

      document.addEventListener("mousedown", toggleOrientationWithRightClick);

      return () => {
         document.removeEventListener("keydown", toggleOrientationWithR);
         document.removeEventListener("mousedown", toggleOrientationWithRightClick);
      };
   }, [toggleOrientation]);

   return { orientation, setOrientation, toggleOrientation };
}
