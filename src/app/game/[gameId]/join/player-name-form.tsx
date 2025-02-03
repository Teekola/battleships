"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { usePlayer } from "@/hooks/use-player";
import { supabase } from "@/lib/supabase";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Game } from "@/utils/db";

import { updatePlayer } from "./actions";
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

   const [game, setGame] = useState(initialGame);

   useEffect(() => {
      // Function to fetch the initial game data
      const fetchGame = async () => {
         const { data, error } = await supabase.from("Game").select("*").eq("id", gameId).single();

         if (error) {
            console.error("Error fetching game:", error);
         } else {
            setGame(data);
         }
      };

      fetchGame();

      // Subscribe to real-time updates for this specific game record
      const channel = supabase
         .channel(`game_${gameId}`)
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "Game", filter: `id=eq.${gameId}` },
            (payload) => {
               console.log("Game record changed:", payload);

               if (payload.eventType === "UPDATE") {
                  setGame(payload.new as Game);
               } else if (payload.eventType === "DELETE") {
                  router.push("/");
               }
            }
         )
         .subscribe();

      return () => {
         supabase.removeChannel(channel);
      };
   }, [gameId, router]);

   async function onSubmit(data: PlayerNameFormData) {
      console.log(data);
      //  Check if there is already a player, if so, go directly to the game start stage!

      if (!game.player1Name) {
         await updatePlayer({ gameId, name: data.name, playerId, isPlayer1: true });
         router.push(`/game/${gameId}/invite`);
         return;
      }

      await updatePlayer({ gameId, name: data.name, playerId, isPlayer1: false });
      // TODO: ALSO UPDATE GAME STATE TO SHIP PLACEMENT!
      router.push(`/game/${gameId}`);
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
