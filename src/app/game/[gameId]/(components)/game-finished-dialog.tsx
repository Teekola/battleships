"use client";

import { GameEndReason, GameState } from "@prisma/client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlayer } from "@/hooks/use-player";
import { Game } from "@/utils/game-db";

import { useGame } from "../(hooks)/use-game";
import { useGameStore } from "../(stores)/game-store-provider";

export function GameFinishedDialog({ initialGame }: { initialGame: Game }) {
   const { game } = useGame(initialGame);
   const winnerId = useGameStore((s) => s.winnerId);
   const { playerId } = usePlayer();
   const winnerName = winnerId === game.player1Id ? game.player1Name : game.player2Name;
   const isOpen = game.state === GameState.FINISHED;

   return (
      <Dialog open={isOpen}>
         <DialogContent hideCloseButton>
            <DialogHeader>
               <DialogTitle>
                  {game.gameEndReason === GameEndReason.TIE
                     ? "It's a Tie!"
                     : winnerId === playerId
                       ? "You Won!"
                       : "You Lost!"}
               </DialogTitle>
            </DialogHeader>
            <div className="text-center">
               {game.gameEndReason === GameEndReason.TIE ? (
                  <p>Both players fought valiantly, but it ended in a tie!</p>
               ) : (
                  <p>{winnerName} is the lucky winner!</p>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
}
