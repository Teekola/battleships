"use client";

import Link from "next/link";

import { GameEndReason, GameState } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";
import { Game } from "@/utils/game-db";

import { useGame } from "../(hooks)/use-game";
import { usePlayersPlayAgainState } from "../(hooks)/use-players-play-again-state";
import { useGameStore } from "../(stores)/game-store-provider";

export function GameFinishedDialog({ initialGame }: { initialGame: Game }) {
   const { game } = useGame(initialGame);
   const winnerId = useGameStore((s) => s.winnerId);
   const { playerId, hasHydrated } = usePlayer();
   const { isPlayAgain, isOpponentPlayAgain, updatePlayAgain, winnerName, opponentName } =
      usePlayersPlayAgainState(initialGame);

   const isRestarting = game.state === GameState.SHIP_PLACEMENT;
   const isOpen = game.state === GameState.FINISHED && !isRestarting;

   if (!hasHydrated) return null;

   if (isRestarting) {
      return (
         <Dialog open={true}>
            <DialogContent hideCloseButton className="text-center">
               <p>Restarting...</p>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isOpen}>
         <DialogContent hideCloseButton className="text-center">
            <DialogHeader>
               <DialogTitle className="text-center">
                  {game.gameEndReason === GameEndReason.TIE
                     ? "It's a Tie!"
                     : winnerId === playerId
                       ? "You Won!"
                       : "You Lost!"}
               </DialogTitle>
            </DialogHeader>

            <div>
               {game.gameEndReason === GameEndReason.TIE ? (
                  <p>Both players fought valiantly, but it ended in a tie!</p>
               ) : (
                  <p>{winnerName} is the lucky winner!</p>
               )}

               {isOpponentPlayAgain && <p>{opponentName} wants to play again!</p>}
            </div>
            <DialogFooter>
               <div className="flex w-full flex-wrap gap-2">
                  <Button
                     className={cn("w-full", isPlayAgain && "animate-pulse")}
                     variant={isPlayAgain ? "green" : "default"}
                     onClick={() => updatePlayAgain(isPlayAgain ? false : true)}
                  >
                     Play again?
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                     <Link href="/">Quit</Link>
                  </Button>
               </div>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
