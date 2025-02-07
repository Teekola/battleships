"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { Game } from "@/utils/game-db";

import { useGameStore } from "../(stores)/game-store-provider";

export function useGame(initialGame: Readonly<Game>) {
   const game = useGameStore((s) => s.game) ?? initialGame;
   const currentTurn = useGameStore((s) => s.currentTurn) ?? initialGame.currentTurn;
   const winnerId = useGameStore((s) => s.winnerId) ?? initialGame.winnerId;
   const setWinnerId = useGameStore((s) => s.setWinnerId);
   const setCurrentTurn = useGameStore((s) => s.setCurrentTurn);
   const setGame = useGameStore((s) => s.setGame);
   const setHasPlayed = useGameStore((s) => s.setHasPlayed);

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
         const game = { ...data } as Game;
         setGame(game);
         setCurrentTurn(game.currentTurn ?? "");
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
                  const game = { ...payload.new } as Game;
                  setGame(game);
                  setWinnerId(game.winnerId ?? null);
                  setTimeout(() => {
                     setCurrentTurn(game.currentTurn ?? "");
                     setHasPlayed(false);
                  }, 1500);
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
   }, [initialGame.id, setGame, setCurrentTurn, setWinnerId, setHasPlayed]);

   return { game, currentTurn, winnerId, error };
}
