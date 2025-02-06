"use client";

import { useEffect, useMemo, useState } from "react";

import { usePlayer } from "@/hooks/use-player";
import { supabase } from "@/lib/supabase";
import { Game } from "@/utils/game-db";
import { AllMovesByPlayerId, MoveDBT, movesToMovesByPlayerId } from "@/utils/move-db";
import { PlacedShipDBT, convertPlacedShipsDBTToPlacedShip } from "@/utils/placed-ship-db";

import { useGameStore } from "../(stores)/game-store-provider";
import { getAllShipsCoordinates } from "../(utils)/get-all-ships-coordinates";
import { useAudio } from "./use-audio";

export function useMoves({
   initialMoves,
   initialGame,
   initialPlayer1PlacedShips,
   initialPlayer2PlacedShips,
}: Readonly<{
   initialMoves: AllMovesByPlayerId;
   initialGame: Game;
   initialPlayer1PlacedShips: PlacedShipDBT[];
   initialPlayer2PlacedShips: PlacedShipDBT[];
}>) {
   const game = useGameStore((s) => s.game) ?? initialGame;
   const { playerId, hasHydrated } = usePlayer();
   const isPlayer1 = game.player1Id === playerId;
   const opponentId = (isPlayer1 ? game.player2Id : game.player1Id)!;
   const ownMovesStored = useGameStore((s) => s.ownMoves);
   const opponentMovesStored = useGameStore((s) => s.opponentMoves);
   const ownShips = isPlayer1 ? initialPlayer1PlacedShips : initialPlayer2PlacedShips;
   const ownShipsCoordinates = useMemo(
      () =>
         getAllShipsCoordinates({
            placedShips: convertPlacedShipsDBTToPlacedShip(ownShips),
         }),
      [ownShips]
   );
   const { playWaterHitSound, playShipHitSound } = useAudio();

   const initialPlayer1Moves = initialMoves[game.player1Id!] ?? [];
   const initialPlayer2Moves = initialMoves[game.player2Id!] ?? [];

   const ownMoves =
      ownMovesStored.length > 0
         ? ownMovesStored
         : isPlayer1
           ? initialPlayer1Moves
           : initialPlayer2Moves;

   const opponentMoves =
      opponentMovesStored.length > 0
         ? opponentMovesStored
         : isPlayer1
           ? initialPlayer2Moves
           : initialPlayer1Moves;

   const addMove = useGameStore((s) => s.addMove);
   const setOwnMoves = useGameStore((s) => s.setOwnMoves);
   const setOpponentMoves = useGameStore((s) => s.setOpponentMoves);
   const setGameEndReason = useGameStore((s) => s.setGameEndReason);
   const setWinnerId = useGameStore((s) => s.setWinnerId);

   const [error, setError] = useState("");

   useEffect(() => {
      if (!hasHydrated) return;

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
         const player1Id = isPlayer1 ? playerId : opponentId;
         const player2Id = isPlayer1 ? opponentId : playerId;
         const player1Moves = movesByPlayerId[player1Id] ?? [];
         const player2Moves = movesByPlayerId[player2Id] ?? [];
         const newOwnMoves = isPlayer1 ? player1Moves : player2Moves;
         const newOpponentMoves = isPlayer1 ? player2Moves : player1Moves;
         setOwnMoves(newOwnMoves);
         setOpponentMoves(newOpponentMoves);
         setError("");
      };

      fetchGame();

      const channel = supabase
         .channel(`moves_${initialGame.id}`)
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "Move", filter: `gameId=eq.${initialGame.id}` },
            async (payload) => {
               console.log("Move record changed:", payload);

               if (payload.eventType === "INSERT") {
                  const move = { ...payload.new } as MoveDBT;
                  if (move.playerId !== playerId) {
                     addMove({
                        ...move,
                        isOwnMove: false,
                     });
                     const isHit = ownShipsCoordinates.has(`${move.x},${move.y}`);

                     const audioFunction = isHit ? playShipHitSound : playWaterHitSound;
                     setTimeout(() => {
                        audioFunction();
                     }, 150);
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
      hasHydrated,
      initialGame.id,
      playerId,
      opponentId,
      isPlayer1,
      setOwnMoves,
      setOpponentMoves,
      addMove,
      setGameEndReason,
      setWinnerId,
      ownShipsCoordinates,
      playShipHitSound,
      playWaterHitSound,
   ]);

   return { opponentMoves, ownMoves, error, addMove, hasHydrated };
}
