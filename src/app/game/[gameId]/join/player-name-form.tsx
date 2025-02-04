"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { GameState } from "@prisma/client";
import { useForm } from "react-hook-form";

import { usePlayer } from "@/hooks/use-player";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Game } from "@/utils/db";

import { useGame } from "../(hooks)/use-game";
import { updateGame } from "./actions";
import { PlayerNameFormData, formSchema } from "./player-name-schema";

export function PlayerNameForm({
   gameId,
   initialGame,
}: Readonly<{ gameId: string; initialGame: Game }>) {
   const router = useRouter();
   const form = useForm<PlayerNameFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
      },
   });
   const { playerId } = usePlayer();
   const { game, error } = useGame(initialGame);

   async function onSubmit(data: PlayerNameFormData) {
      console.log(data);
      //  Check if there is already a player, if so, go directly to the game start stage!

      if (!game.player1Name) {
         await updateGame({
            gameId,
            playerName: data.name,
            playerId,
            isPlayer1: true,
            state: GameState.WAITING_FOR_PLAYER,
         });
         router.push(`/game/${gameId}/invite`);
         return;
      }

      await updateGame({
         gameId,
         playerName: data.name,
         playerId,
         isPlayer1: false,
         state: GameState.SHIP_PLACEMENT,
      });
      router.push(`/game/${gameId}`);
   }

   if (error) {
      return <p>{error}</p>;
   }

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-xs flex-col justify-between gap-4"
         >
            <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Name</FormLabel>
                     <FormControl>
                        <Input {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <Button type="submit">Enter Game</Button>
         </form>
      </Form>
   );
}
