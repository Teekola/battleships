"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { usePlayer } from "@/hooks/use-player";
import { supabase } from "@/lib/supabase";
import { Game } from "@/utils/game-db";

import { useGameStore } from "../(stores)/game-store-provider";

export function useGame(initialGame: Readonly<Game>) {
   const game = useGameStore((s) => s.game) ?? initialGame;
   const currentTurn = useGameStore((s) => s.currentTurn) ?? initialGame.currentTurn;
   const winnerId = useGameStore((s) => s.winnerId) ?? initialGame.winnerId;
   const setWinnerId = useGameStore((s) => s.setWinnerId);
   const setCurrentTurn = useGameStore((s) => s.setCurrentTurn);
   const setOwnTurnsPlayed = useGameStore((s) => s.setOwnTurnsPlayed);
   const setOpponentTurnsPlayed = useGameStore((s) => s.setOpponentTurnsPlayed);
   const setGame = useGameStore((s) => s.setGame);
   const setHasPlayed = useGameStore((s) => s.setHasPlayed);
   const { hasHydrated, playerId } = usePlayer();
   const isPlayer1 = playerId === game.player1Id;
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const router = useRouter();

   const [error, setError] = useState("");

   useEffect(() => {
      if (!hasHydrated) return;
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
         const newGame = { ...data } as Game;

         setGame(newGame);
         setCurrentTurn(newGame.currentTurn);
         setOwnTurnsPlayed(isPlayer1 ? newGame.player1PlayedTurns : newGame.player2PlayedTurns);
         setOpponentTurnsPlayed(
            isPlayer1 ? newGame.player2PlayedTurns : newGame.player1PlayedTurns
         );

         setError("");
      };

      fetchGame();

      const channel = supabase
         .channel(`game_${initialGame.id}`)
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "Game", filter: `id=eq.${initialGame.id}` },
            (payload) => {
               console.log(payload.eventType);

               if (payload.eventType === "UPDATE") {
                  console.log("Game record changed:", payload);
                  const newGame = { ...payload.new } as Game;
                  setGame(newGame);
                  setWinnerId(newGame.winnerId);

                  // Clear the timeout here to prevent old timeout from overwriting a correct value temporarily and causing flicker
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  timeoutRef.current = setTimeout(() => {
                     setCurrentTurn(newGame.currentTurn);
                     setHasPlayed(false);
                     setOwnTurnsPlayed(
                        isPlayer1 ? newGame.player1PlayedTurns : newGame.player2PlayedTurns
                     );
                     setOpponentTurnsPlayed(
                        isPlayer1 ? newGame.player2PlayedTurns : newGame.player1PlayedTurns
                     );
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
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
   }, [
      router,
      hasHydrated,
      isPlayer1,
      initialGame.id,
      setGame,
      setCurrentTurn,
      setWinnerId,
      setHasPlayed,
      setOwnTurnsPlayed,
      setOpponentTurnsPlayed,
   ]);

   return { game, currentTurn, winnerId, error };
}
