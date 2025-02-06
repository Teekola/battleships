"use client";

import Link from "next/link";

import { GameEndReason, GameState } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";
import { Game } from "@/utils/game-db";

import { useGame } from "../(hooks)/use-game";
import { usePlayersPlayAgainState } from "../(hooks)/use-players-play-again-state";

export function GameFinishedDialog({ initialGame }: { initialGame: Game }) {
   const { game, winnerId } = useGame(initialGame);

   const { playerId, hasHydrated } = usePlayer();
   const { isPlayAgain, isOpponentPlayAgain, updatePlayAgain, winnerName, opponentName } =
      usePlayersPlayAgainState(initialGame);

   const isFinished = game.state === GameState.FINISHED;
   const isRestarting = game.state === GameState.SHIP_PLACEMENT;

   if (!hasHydrated) return null;

   if (isFinished && !winnerId && game.gameEndReason !== "TIE") return null;

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
