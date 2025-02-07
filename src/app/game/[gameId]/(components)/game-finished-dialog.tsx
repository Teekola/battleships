"use client";

import Link from "next/link";

import { GameEndReason } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Game } from "@/utils/game-db";

import { useGameFinishedDialog } from "../(hooks)/use-game-finished-dialog";

export function GameFinishedDialog({ initialGame }: { initialGame: Game }) {
   const {
      game,
      isPlayAgain,
      isOpponentPlayAgain,
      updatePlayAgain,
      playerId,
      hasHydrated,
      winnerName,
      winnerId,
      opponentName,
      isFinished,
      isRestarting,
      isTie,
   } = useGameFinishedDialog(initialGame);

   console.log({ isFinished, isTie });

   if (!hasHydrated) return null;
   if (isFinished && !winnerId && !isTie) return null;

   if (isRestarting) {
      return (
         <Dialog open={true}>
            <DialogContent hideCloseButton className="text-center">
               <DialogHeader className="sr-only">
                  <DialogTitle>Restarting...</DialogTitle>
               </DialogHeader>
               <DialogDescription>Restarting...</DialogDescription>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isFinished}>
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

            <DialogDescription>
               {game.gameEndReason === GameEndReason.TIE
                  ? "Both players fought valiantly, but it ended in a tie!"
                  : `${winnerName} is the lucky winner!`}
            </DialogDescription>
            {isOpponentPlayAgain && (
               <p className="text-sm text-green-500">{opponentName} wants to play again!</p>
            )}
            <DialogFooter>
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
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
