import { GameEndReason } from "@prisma/client";
import { createStore } from "zustand/vanilla";

import { Game } from "@/utils/game-db";
import { MoveDBT } from "@/utils/move-db";

export type GameStoreState = {
   game: Game | null;
   currentTurn: string;
   player1Moves: MoveDBT[];
   player2Moves: MoveDBT[];
   ownMoves: MoveDBT[];
   opponentMoves: MoveDBT[];
   winnerId?: string;
   gameEndReason?: GameEndReason;
   ownShipsRemaining?: number;
   opponentShipsRemaining?: number;
   ownHitsRemaining?: number;
   opponentHitsRemaining?: number;
};

export type GameStoreActions = {
   setGame: (g: Game) => void;
   setCurrentTurn: (playerId: string) => void;
   setOwnShipsRemaining: (n: number) => void;
   setOpponentShipsRemaining: (n: number) => void;
   setOwnHitsRemaining: (n: number) => void;
   setOpponentHitsRemaining: (n: number) => void;
   setWinnerId: (s: string) => void;
   setGameEndReason: (r: GameEndReason) => void;
   setPlayer1Moves: (moves: MoveDBT[]) => void;
   setPlayer2Moves: (moves: MoveDBT[]) => void;
   setOwnMoves: (moves: MoveDBT[]) => void;
   setOpponentMoves: (moves: MoveDBT[]) => void;
   addMove: ({
      id,
      gameId,
      playerId,
      isPlayer1,
      x,
      y,
   }: {
      id: number;
      gameId: string;
      playerId: string;
      isPlayer1: boolean;
      x: number;
      y: number;
   }) => void;
   addMove2: ({
      id,
      gameId,
      playerId,
      isOwnMove,
      x,
      y,
   }: {
      id: number;
      gameId: string;
      playerId: string;
      isOwnMove: boolean;
      x: number;
      y: number;
   }) => void;
};

export type GameStore = GameStoreState & GameStoreActions;

export const defaultInitState: GameStoreState = {
   game: null,
   currentTurn: "",
   player1Moves: [],
   player2Moves: [],
   ownMoves: [],
   opponentMoves: [],
};

export function createGameStore(initState: GameStoreState = defaultInitState) {
   return createStore<GameStore>((set) => ({
      ...initState,
      setGame: (g) => set((state) => ({ ...state, game: g })),
      setCurrentTurn: (playerId) => set((state) => ({ ...state, currentTurn: playerId })),
      setOwnHitsRemaining: (n) => set((state) => ({ ...state, ownHitsRemaining: n })),
      setOpponentHitsRemaining: (n) => set((state) => ({ ...state, opponentHitsRemaining: n })),
      setOwnShipsRemaining: (n) => set((state) => ({ ...state, ownShipsRemaining: n })),
      setOpponentShipsRemaining: (n) => set((state) => ({ ...state, opponentShipsRemaining: n })),
      setWinnerId: (s) => set((state) => ({ ...state, winnerId: s })),
      setGameEndReason: (r) => set((state) => ({ ...state, gameEndReason: r })),
      setPlayer1Moves: (moves) => set((state) => ({ ...state, player1Moves: moves })),
      setPlayer2Moves: (moves) => set((state) => ({ ...state, player2Moves: moves })),
      setOwnMoves: (moves) => set((state) => ({ ...state, ownMoves: moves })),
      setOpponentMoves: (moves) => set((state) => ({ ...state, opponentMoves: moves })),
      addMove: ({ id, gameId, playerId, isPlayer1, x, y }) =>
         set((state) => {
            const updatedMoves = (isPlayer1 ? state.player1Moves : state.player2Moves)?.concat([
               { id, gameId, playerId, x, y },
            ]) ?? [{ id, gameId, playerId, x, y }];

            return {
               ...state,
               ...(isPlayer1 ? { player1Moves: updatedMoves } : { player2Moves: updatedMoves }),
            };
         }),
      addMove2: ({ id, gameId, playerId, isOwnMove, x, y }) =>
         set((state) => {
            const updatedMoves = (isOwnMove ? state.ownMoves : state.opponentMoves)?.concat([
               { id, gameId, playerId, x, y },
            ]) ?? [{ id, gameId, playerId, x, y }];

            return {
               ...state,
               ...(isOwnMove ? { ownMoves: updatedMoves } : { opponentMoves: updatedMoves }),
            };
         }),
   }));
}
