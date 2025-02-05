import { ComponentProps } from "react";

import { ShipType, shipSizes } from "@/app/create-game/create-game-form-schema";
import { cn } from "@/lib/utils";

import { ShipAmounts, ShipOrientation } from "../../(utils)/types";
import { DraggableShip } from "../draggable-ship";
import { ShipCatalogueItem } from "./ship-catalogue-item";

interface ShipCatalogueProps extends ComponentProps<"div"> {
   shipsToPlace: ShipAmounts;
   orientation: ShipOrientation;
   draggingId: string | null;
}

export function ShipCatalogue({
   shipsToPlace,
   orientation,
   draggingId,
   ...props
}: Readonly<ShipCatalogueProps>) {
   const shouldDisplayGhost = (shipType: ShipType) => {
      return draggingId?.startsWith(shipType) || shipsToPlace[shipType] < 1;
   };

   return (
      <div {...props}>
         <div className={cn("flex flex-col gap-2", props.className && props.className)}>
            {(Object.keys(shipsToPlace) as ShipType[]).map((shipType) => (
               <div key={shipType} className="relative">
                  {shipsToPlace[shipType] > 0 && (
                     <DraggableShip
                        className="w-fit"
                        key={shipType}
                        size={shipSizes[shipType]}
                        orientation={orientation}
                        shipId={`${shipType}-${shipsToPlace[shipType]}`}
                     >
                        {!draggingId?.startsWith(shipType) && (
                           <ShipCatalogueItem size={shipSizes[shipType]} />
                        )}
                     </DraggableShip>
                  )}
                  <div
                     className={cn(
                        "absolute left-0 top-0 -z-10",
                        shipsToPlace[shipType] < 1 && "opacity-50",
                        shipsToPlace[shipType] === 1 && draggingId && "opacity-50"
                     )}
                  >
                     <ShipCatalogueItem size={shipSizes[shipType]} />
                  </div>
                  {shouldDisplayGhost(shipType) && <div className="h-8"></div>}
               </div>
            ))}
         </div>
      </div>
   );
}
