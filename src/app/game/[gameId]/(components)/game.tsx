import { OwnGameBoard } from "./own-game-board";

export function Game() {
   return (
      <div>
         <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
            <OwnGameBoard
               size={6}
               moves={[
                  { x: 5, y: 5 },
                  { x: 1, y: 5 },
                  { x: 1, y: 4 },
                  { x: 1, y: 3 },
                  { x: 1, y: 2 },
                  { x: 1, y: 1 },
                  { x: 2, y: 3 },
               ]}
               placedShips={[
                  {
                     coordinates: { x: 1, y: 1 },
                     id: "carrier",
                     shipType: "carrier",
                     size: 5,
                     orientation: "vertical",
                  },
               ]}
            />
         </div>
      </div>
   );
}
