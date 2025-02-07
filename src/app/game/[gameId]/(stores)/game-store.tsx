import { GameEndReason } from "@prisma/client";
import { createStore } from "zustand/vanilla";

import { Game } from "@/utils/game-db";
import { MoveDBT } from "@/utils/move-db";

export type GameStoreState = {
   game: Game | null;
   currentTurn: string | null;
   ownTurnsPlayed: number | null;
   opponentTurnsPlayed: number | null;
   ownMoves: MoveDBT[];
   opponentMoves: MoveDBT[];
   winnerId: string | null;
   gameEndReason?: GameEndReason;
   ownShipsRemaining?: number;
   opponentShipsRemaining?: number;
   ownHitsRemaining?: number;
   opponentHitsRemaining?: number;
   hasPlayed: boolean;
   lastCheckedTurns: number;
};

export type GameStoreActions = {
   reset: () => void;
   setGame: (g: Game) => void;
   setCurrentTurn: (playerId: string | null) => void;
   setOwnShipsRemaining: (n: number) => void;
   setOpponentShipsRemaining: (n: number) => void;
   setOwnHitsRemaining: (n: number) => void;
   setOpponentHitsRemaining: (n: number) => void;
   setLastCheckedTurns: (n: number) => void;
   setWinnerId: (s: string | null) => void;
   setGameEndReason: (r: GameEndReason) => void;
   setOwnMoves: (moves: MoveDBT[]) => void;
   setOpponentMoves: (moves: MoveDBT[]) => void;
   incrementOwnTurnsPlayed: () => void;
   incrementOpponentTurnsPlayed: () => void;
   setOwnTurnsPlayed: (turns: number) => void;
   setOpponentTurnsPlayed: (turns: number) => void;
   setHasPlayed: (hasPlayed: boolean) => void;
   addMove: ({
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
   }) => {
      ownMoves: MoveDBT[];
      opponentMoves: MoveDBT[];
      ownHitsRemaining?: number;
      opponentHitsRemaining?: number;
   };
};

export type GameStore = GameStoreState & GameStoreActions;

export const defaultInitState: GameStoreState = {
   game: null,
   currentTurn: null,
   ownMoves: [],
   opponentMoves: [],
   hasPlayed: false,
   winnerId: null,
   ownTurnsPlayed: null,
   opponentTurnsPlayed: null,
   lastCheckedTurns: -1,
};

export function createGameStore(initState: GameStoreState = defaultInitState) {
   return createStore<GameStore>((set, get) => ({
      ...initState,
      reset: () => set(() => ({ ...initState })),
      incrementOwnTurnsPlayed: () =>
         set((state) => ({ ...state, ownTurnsPlayed: (state.ownTurnsPlayed ?? 0) + 1 })),
      incrementOpponentTurnsPlayed: () =>
         set((state) => ({ ...state, ownTurnsPlayed: (state.opponentTurnsPlayed ?? 0) + 1 })),
      setGame: (g) => set((state) => ({ ...state, game: g })),
      setOwnTurnsPlayed: (n) => set((state) => ({ ...state, ownTurnsPlayed: n })),
      setOpponentTurnsPlayed: (n) => set((state) => ({ ...state, opponentTurnsPlayed: n })),
      setLastCheckedTurns: (n) => set((state) => ({ ...state, lastCheckedTurns: n })),
      setCurrentTurn: (playerId) => set((state) => ({ ...state, currentTurn: playerId })),
      setOwnHitsRemaining: (n) => set((state) => ({ ...state, ownHitsRemaining: n })),
      setOpponentHitsRemaining: (n) => set((state) => ({ ...state, opponentHitsRemaining: n })),
      setOwnShipsRemaining: (n) => set((state) => ({ ...state, ownShipsRemaining: n })),
      setOpponentShipsRemaining: (n) => set((state) => ({ ...state, opponentShipsRemaining: n })),
      setWinnerId: (s) => set((state) => ({ ...state, winnerId: s })),
      setGameEndReason: (r) => set((state) => ({ ...state, gameEndReason: r })),
      setOwnMoves: (moves) => set((state) => ({ ...state, ownMoves: moves })),
      setOpponentMoves: (moves) => set((state) => ({ ...state, opponentMoves: moves })),
      addMove: ({ id, gameId, playerId, isOwnMove, x, y }) => {
         set((state) => {
            const updatedMoves = (isOwnMove ? state.ownMoves : state.opponentMoves)?.concat([
               { id, gameId, playerId, x, y },
            ]) ?? [{ id, gameId, playerId, x, y }];

            return {
               ...state,
               ...(isOwnMove ? { ownMoves: updatedMoves } : { opponentMoves: updatedMoves }),
            };
         });

         const { ownMoves, opponentMoves, ownHitsRemaining, opponentHitsRemaining } = get();

         return { ownMoves, opponentMoves, ownHitsRemaining, opponentHitsRemaining };
      },
      setHasPlayed: (hasPlayed) => set((state) => ({ ...state, hasPlayed })),
   }));
}
