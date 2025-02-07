import { GameEndReason, GameMode, GameState, Prisma } from "@prisma/client";

import { generateGameId } from "@/app/create-game/generate-game-id";
import { prisma } from "@/lib/prisma";

const defaultGameArgs = Prisma.validator<Prisma.GameDefaultArgs>()({
   select: {
      id: true,
      gameMode: true,
      player1Id: true,
      player2Id: true,
      player1Name: true,
      player2Name: true,
      player1Ready: true,
      player2Ready: true,
      player1PlayAgain: true,
      player2PlayAgain: true,
      player1PlayedTurns: true,
      player2PlayedTurns: true,
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
   gameMode: GameMode;
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
   gameMode?: GameMode;
   playerName?: string;
   playerId?: string;
   isPlayer1?: boolean;
   playerReady?: boolean;
   playAgain?: boolean;
   playerPlayedTurns?: number;
   winnerId?: string;
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
export interface ChangeTurnArgs {
   gameId: string;
   nextTurn: string;
   isPlayer1: boolean;
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
            player1PlayedTurns: 0,
            player2PlayedTurns: 0,
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

   async changeTurn({ gameId, isPlayer1, nextTurn }: ChangeTurnArgs) {
      await prisma.game.update({
         where: { id: gameId },
         data: {
            currentTurn: nextTurn,
            ...(isPlayer1
               ? {
                    player1PlayedTurns: { increment: 1 },
                 }
               : { player2PlayedTurns: { increment: 1 } }),
         },
      });
   }

   async restartGame({ gameId }: RestartGameArgs) {
      const psDeletePromise = prisma.placedShip.deleteMany({
         where: { gameId },
      });
      const moveDeletePromise = prisma.move.deleteMany({
         where: { gameId },
      });
      await Promise.all([psDeletePromise, moveDeletePromise]);

      await prisma.game.update({
         where: { id: gameId },
         data: {
            state: GameState.SHIP_PLACEMENT,
            gameEndReason: null,
            player1Ready: false,
            player2Ready: false,
            player1PlayAgain: false,
            player2PlayAgain: false,
            player1PlayedTurns: 0,
            player2PlayedTurns: 0,
         },
      });
   }

   async startGame({ gameId, playerIds }: { gameId: string; playerIds: string[] }) {
      const turn = playerIds[Math.round(Math.random())];
      await prisma.game.update({
         where: { id: gameId },
         data: {
            currentTurn: turn,
            state: GameState.PLAYING,
            player1Ready: false,
            player2Ready: false,
            player1PlayAgain: false,
            player2PlayAgain: false,
         },
      });
   }

   async cleanUpDatabase() {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      try {
         // Get games older than 6 hours or older than 1 hours that are finished or waiting for player
         const gamesToDelete = await prisma.game.findMany({
            where: {
               OR: [
                  {
                     updatedAt: {
                        lte: sixHoursAgo,
                     },
                  },
                  {
                     AND: [
                        {
                           updatedAt: {
                              lte: oneHourAgo,
                           },
                        },
                        {
                           state: {
                              in: [GameState.FINISHED, GameState.WAITING_FOR_PLAYER],
                           },
                        },
                     ],
                  },
               ],
            },
         });

         if (gamesToDelete.length === 0) {
            return { success: true, message: "No games to delete" };
         }

         // Delete related records and the games themselves
         const deleted = await prisma.game.deleteMany({
            where: {
               id: {
                  in: gamesToDelete.map((game) => game.id),
               },
            },
         });
         return {
            success: true,
            message: `${deleted.count} games and related records cleaned up successfully`,
         };
      } catch (error) {
         console.error(error);
         return { success: false, message: "Internal Server Error" };
      }
   }
}
