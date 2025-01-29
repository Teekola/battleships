"use client";

export default function GamePage() {
   return (
      <div className="h-full">
         <GameBoard size={5} />
      </div>
   );
}

type Coordinate = {
   x: number;
   y: number;
};

type GameBoardT = Coordinate[][];

function generateGameBoard(size: number): GameBoardT {
   const board: GameBoardT = [];
   for (let y = 0; y < size; y++) {
      const row: Coordinate[] = [];
      for (let x = 0; x < size; x++) {
         row.push({ x, y });
      }
      board.push(row);
   }
   return board;
}

function GameBoard({ size }: Readonly<{ size: number }>) {
   const board = generateGameBoard(size);

   return (
      <div className="max-h-lg aspect-square max-w-lg">
         <div
            className="grid h-full w-full gap-1 bg-blue-950"
            style={{
               gridTemplateColumns: `repeat(${size}, 1fr)`,
               gridTemplateRows: `repeat(${size}, 1fr)`,
            }}
         >
            {board.flat().map((cell) => (
               <div
                  key={`${cell.x}-${cell.y}`}
                  className="group flex h-full w-full cursor-pointer items-center justify-center"
               >
                  <div className="h-5 w-5 rounded-full bg-blue-300 group-hover:bg-blue-500"></div>
               </div>
            ))}
         </div>
      </div>
   );
}
