import { GameEndReason, GameState, Prisma } from "@prisma/client";

import { generateGameId } from "@/app/create-game/generate-game-id";
import { prisma } from "@/lib/prisma";

const defaultGameArgs = Prisma.validator<Prisma.GameDefaultArgs>()({
   select: {
      id: true,
      player1Id: true,
      player2Id: true,
      player1Name: true,
      player2Name: true,
      player1Ready: true,
      player2Ready: true,
      player1PlayAgain: true,
      player2PlayAgain: true,
      winnerId: true,
      state: true,
      gameEndReason: true,
      currentTurn: true,
      boardSize: true,
      carriers: true,
      battleships: true,
      cruisers: true,
      submarines: true,
      destroyers: true,
   },
});

export type Game = Prisma.GameGetPayload<typeof defaultGameArgs>;

export interface CreateGameArgs {
   boardSize: number;
   player1Id: string;
   carriers: number;
   battleships: number;
   cruisers: number;
   submarines: number;
   destroyers: number;
}

export interface UpdateGameArgs {
   gameId: string;
   playerName?: string;
   playerId?: string;
   isPlayer1?: boolean;
   playerReady?: boolean;
   playAgain?: boolean;
   state?: GameState;
   currentTurn?: string;
   gameEndReason?: GameEndReason;
   boardSize?: number;
   player1Id?: string;
   carriers?: number;
   battleships?: number;
   cruisers?: number;
   submarines?: number;
   destroyers?: number;
}

export interface RestartGameArgs {
   gameId: string;
}

export class GameDB {
   constructor() {}

   async create(data: CreateGameArgs) {
      const id = generateGameId();
      await prisma.game.create({
         data: {
            id,
            ...data,
            state: GameState.WAITING_FOR_PLAYER,
         },
      });
      return id;
   }

   async getById(id: string) {
      const game = await prisma.game.findUnique({
         where: { id },
         select: defaultGameArgs.select,
      });
      return game;
   }

   async update({
      gameId,
      playerName,
      playerId,
      playerReady,
      isPlayer1,
      playAgain,
      ...rest
   }: UpdateGameArgs) {
      const game = await prisma.game.update({
         where: {
            id: gameId,
         },
         data: {
            ...(isPlayer1
               ? {
                    ...(playerName && { player1Name: playerName }),
                    ...(playerId && { player1Id: playerId }),
                    player1Ready: playerReady ?? false,
                    player1PlayAgain: playAgain ?? false,
                    ...rest,
                 }
               : {
                    ...(playerName && { player2Name: playerName }),
                    ...(playerId && { player2Id: playerId }),
                    player2Ready: playerReady ?? false,
                    player2PlayAgain: playAgain ?? false,
                    ...rest,
                 }),
         },
         select: defaultGameArgs.select,
      });
      return game;
   }

   async restartGame({ gameId }: RestartGameArgs) {
      const psDeletePromise = prisma.placedShip.deleteMany({
         where: { gameId },
      });
      const moveDeletePromise = prisma.move.deleteMany({
         where: { gameId },
      });
      await Promise.all([psDeletePromise, moveDeletePromise]);

      const game = await prisma.game.update({
         where: { id: gameId },
         data: {
            state: GameState.SHIP_PLACEMENT,
            gameEndReason: null,
            player1Ready: false,
            player2Ready: false,
            player1PlayAgain: false,
            player2PlayAgain: false,
         },
      });
      console.log(game);
   }

   async startGame({ gameId, playerIds }: { gameId: string; playerIds: string[] }) {
      const turn = playerIds[Math.round(Math.random())];
      await prisma.game.update({
         where: { id: gameId },
         data: {
            currentTurn: turn,
            state: GameState.PLAYING,
            player1Ready: true,
            player2Ready: true,
         },
      });
   }
}
