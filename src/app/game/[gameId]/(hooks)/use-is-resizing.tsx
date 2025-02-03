import { useEffect, useMemo, useState } from "react";

import debounce from "lodash.debounce";

export function useIsResizing() {
   const [isResizing, setIsResizing] = useState(false);

   const handleResize = useMemo(
      () =>
         debounce(() => {
            setIsResizing(false);
         }, 300),
      []
   );

   useEffect(() => {
      const onResize = () => {
         setIsResizing(true);
         handleResize();
      };

      window.addEventListener("resize", onResize);

      return () => {
         window.removeEventListener("resize", onResize);
         handleResize.cancel();
      };
   }, [handleResize]);

   return isResizing;
}
