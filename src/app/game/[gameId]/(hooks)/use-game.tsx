"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { Game } from "@/utils/db";

export function useGame(initialGame: Readonly<Game>) {
   const [game, setGame] = useState(initialGame);
   const [error, setError] = useState("");

   useEffect(() => {
      const fetchGame = async () => {
         const { data, error } = await supabase
            .from("Game")
            .select("*")
            .eq("id", initialGame.id)
            .single();

         if (error) {
            console.error("Error fetching game:", error);
            setError(error.message + " " + error.details);
            return;
         }
         setGame(data as Game);
         setError("");
      };

      fetchGame();

      const channel = supabase
         .channel(`game_${initialGame.id}`)
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "Game", filter: `id=eq.${initialGame.id}` },
            (payload) => {
               console.log("Game record changed:", payload);

               if (payload.eventType === "UPDATE") {
                  setGame(payload.new as Game);
               } else if (payload.eventType === "DELETE") {
                  console.error(`Game ${initialGame.id} has been deleted.`);
                  setError(`Game ${initialGame.id} has been deleted.`);
               }
            }
         )
         .subscribe();

      return () => {
         supabase.removeChannel(channel);
      };
   }, [initialGame.id]);

   return { game, error };
}
