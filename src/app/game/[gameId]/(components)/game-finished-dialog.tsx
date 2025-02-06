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
import { Game } from "@/utils/game-db";

import { useGame } from "../(hooks)/use-game";
import { useGameStore } from "../(stores)/game-store-provider";

export function GameFinishedDialog({ initialGame }: { initialGame: Game }) {
   const { game } = useGame(initialGame);
   const winnerId = useGameStore((s) => s.winnerId);
   const { playerId, hasHydrated } = usePlayer();

   const winnerName = winnerId === game.player1Id ? game.player1Name : game.player2Name;
   const opponentName = playerId === game.player1Id ? game.player2Name : game.player2Name;
   const isOpen = game.state === GameState.FINISHED;
   const opponentPlayAgain =
      playerId === game.player1Id ? game.player2PlayAgain : game.player1PlayAgain;

   if (!hasHydrated) return null;

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

               {opponentPlayAgain && <p>{opponentName} wants to play again!</p>}
            </div>
            <DialogFooter>
               <div className="flex w-full flex-wrap gap-2">
                  <Button className="w-full">Play again?</Button>
                  <Button variant="outline" asChild className="w-full">
                     <Link href="/">Quit</Link>
                  </Button>
               </div>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
