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
   player1Id: string;
   player2Id: string;
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
                    ...(playAgain && { player1PlayAgain: playAgain }),
                    ...rest,
                 }
               : {
                    ...(playerName && { player2Name: playerName }),
                    ...(playerId && { player2Id: playerId }),
                    player2Ready: playerReady ?? false,
                    ...(playAgain && { player2PlayAgain: playAgain }),
                    ...rest,
                 }),
         },
         select: defaultGameArgs.select,
      });
      return game;
   }

   async restartGame({ gameId, player1Id, player2Id }: RestartGameArgs) {
      const turn = [player1Id, player2Id][Math.round(Math.random())];

      await prisma.$transaction([
         prisma.game.update({
            where: { id: gameId },
            data: {
               currentTurn: turn,
               state: GameState.SHIP_PLACEMENT,
               gameEndReason: null,
               player1Ready: false,
               player2Ready: false,
               player1PlayAgain: false,
               player2PlayAgain: false,
            },
         }),
         prisma.placedShip.deleteMany({
            where: { gameId },
         }),
         prisma.move.deleteMany({
            where: { gameId },
         }),
      ]);
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
