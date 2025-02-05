"use client";

import { useEffect, useState } from "react";

import { usePlayer } from "@/hooks/use-player";
import { supabase } from "@/lib/supabase";
import { Game } from "@/utils/game-db";
import { AllMovesByPlayerId, MoveDBT, movesToMovesByPlayerId } from "@/utils/move-db";

import { useGameStore } from "../(stores)/game-store-provider";

export function useMoves({
   initialMoves,
   initialGame,
}: Readonly<{ initialMoves: AllMovesByPlayerId; initialGame: Game }>) {
   const game = useGameStore((s) => s.game) ?? initialGame;
   const { playerId } = usePlayer();
   const isPlayer1 = game.player1Id === playerId;
   const opponentId = isPlayer1 ? game.player2Id : game.player1Id;
   const player1Moves = useGameStore((s) => s.player1Moves);
   const player2Moves = useGameStore((s) => s.player2Moves);

   const initialPlayer1Moves = initialMoves[game.player1Id!] ?? [];
   const initialPlayer2Moves = initialMoves[game.player2Id!] ?? [];

   const ownMoves = isPlayer1
      ? player1Moves.length > 0
         ? player1Moves
         : initialPlayer1Moves
      : player2Moves.length > 0
        ? player2Moves
        : initialPlayer2Moves;
   const opponentMoves = isPlayer1
      ? player2Moves.length > 0
         ? player2Moves
         : initialPlayer2Moves
      : player1Moves.length > 0
        ? player1Moves
        : initialPlayer1Moves;

   const addMove = useGameStore((s) => s.addMove);
   const addMove2 = useGameStore((s) => s.addMove2);
   const setPlayer1Moves = useGameStore((s) => s.setPlayer1Moves);
   const setPlayer2Moves = useGameStore((s) => s.setPlayer2Moves);
   const setOwnMoves = useGameStore((s) => s.setOwnMoves);
   const setOpponentMoves = useGameStore((s) => s.setOpponentMoves);

   const [error, setError] = useState("");

   useEffect(() => {
      const fetchGame = async () => {
         const { data, error } = await supabase
            .from("Move")
            .select("*")
            .eq("gameId", initialGame.id)
            .order("createdAt");

         if (error) {
            console.error("Error fetching game:", error);
            setError(error.message + " " + error.details);
            return;
         }
         const moves = [...data] as MoveDBT[];
         const movesByPlayerId = movesToMovesByPlayerId(moves);

         const player1Moves = movesByPlayerId[game.player1Id!] ?? [];
         const player2Moves = movesByPlayerId[game.player2Id!] ?? [];
         setPlayer1Moves(player1Moves);
         setPlayer2Moves(player2Moves);
         setOwnMoves(isPlayer1 ? player1Moves : player2Moves);
         setOpponentMoves(isPlayer1 ? player2Moves : player1Moves);
         setError("");
      };

      fetchGame();

      const channel = supabase
         .channel(`moves_${initialGame.id}`)
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "Move", filter: `gameId=eq.${initialGame.id}` },
            (payload) => {
               console.log("Move record changed:", payload);

               if (payload.eventType === "INSERT") {
                  const move = { ...payload.new } as MoveDBT;
                  if (move.playerId !== playerId) {
                     addMove({ ...move, isPlayer1: opponentId === game.player1Id });
                     addMove2({ ...move, isOwnMove: false });
                  }
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
   }, [
      initialGame.id,
      addMove,
      playerId,
      isPlayer1,
      game.player1Id,
      game.player2Id,
      setPlayer1Moves,
      setPlayer2Moves,
      opponentId,
      setOwnMoves,
      setOpponentMoves,
      addMove2,
   ]);

   return { opponentMoves, ownMoves, error, addMove, addMove2 };
}
