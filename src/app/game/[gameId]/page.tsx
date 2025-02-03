"use client";

import { useState } from "react";

import { Game } from "./(components)/game";
import { ShipPlacement } from "./(components)/ship-placement";

type GameState = "ship-placement" | "game";

export default function GamePage() {
   const [gameState] = useState<GameState>("game");
   return (
      <>
         {gameState === "ship-placement" && <ShipPlacement />}
         {gameState === "game" && <Game />}
      </>
   );
}
