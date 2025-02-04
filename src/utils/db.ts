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
      state: true,
      boardSize: true,
      carriers: true,
      battleships: true,
      cruisers: true,
      submarines: true,
      destroyers: true,
   },
});

export type Game = Prisma.GameGetPayload<typeof defaultGameArgs>;

class GameDB {
   constructor() {}

   async create(data: CreateGameArgs) {
      const id = generateGameId();
      const newGame = await prisma.game.create({
         data: {
            id,
            ...data,
            state: GameState.WAITING_FOR_PLAYER,
         },
      });
      console.log("Created new game", newGame);
      return id;
   }

   async getById(id: string) {
      const game = await prisma.game.findUnique({
         where: { id },
         select: defaultGameArgs.select,
      });
      return game;
   }

   async update({ gameId, playerName, playerId, playerReady, isPlayer1, ...rest }: UpdateGameArgs) {
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
                    ...rest,
                 }
               : {
                    ...(playerName && { player2Name: playerName }),
                    ...(playerId && { player2Id: playerId }),
                    player2Ready: playerReady ?? false,
                    ...rest,
                 }),
         },
         select: defaultGameArgs.select,
      });
      console.log(game);
      return game;
   }
}

const globalForDB = global as unknown as { db: DB };

class DB {
   public game: GameDB;
   private static client: DB;

   private constructor() {
      this.game = new GameDB();
   }

   public static getClient() {
      if (!DB.client) {
         DB.client = new DB();
      }
      return DB.client;
   }
}

export const db = globalForDB.db || DB.getClient();

if (process.env.NODE_ENV !== "production") {
   globalForDB.db = db;
}

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
   state?: GameState;
   gameEndReason?: GameEndReason;
   boardSize?: number;
   player1Id?: string;
   carriers?: number;
   battleships?: number;
   cruisers?: number;
   submarines?: number;
   destroyers?: number;
}
