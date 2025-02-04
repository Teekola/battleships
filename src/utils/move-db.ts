import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const defaultMoveArgs = Prisma.validator<Prisma.MoveDefaultArgs>()({
   select: {
      id: true,
      gameId: true,
      playerId: true,
      x: true,
      y: true,
   },
});

export type MoveDBT = Prisma.MoveGetPayload<typeof defaultMoveArgs>;

export interface CreateMoveArgs {
   gameId: string;
   playerId: string;
   x: number;
   y: number;
}

export interface GetAllMovesArgs {
   gameId: string;
}

export type AllMovesByPlayerId = Record<string, MoveDBT[]>;

export function movesToMovesByPlayerId(moves: MoveDBT[]) {
   const movesByPlayerId: Record<string, MoveDBT[]> = {};
   moves.forEach((move) => {
      movesByPlayerId[move.playerId] = (movesByPlayerId[move.playerId] ?? []).concat([move]);
   });
   return movesByPlayerId;
}

export class MoveDB {
   constructor() {}

   async create({ gameId, playerId, x, y }: CreateMoveArgs) {
      return await prisma.move.create({
         data: { gameId, playerId, x, y },
         select: defaultMoveArgs.select,
      });
   }

   async getAll({ gameId }: GetAllMovesArgs) {
      const moves = await prisma.move.findMany({
         where: { gameId },
         select: defaultMoveArgs.select,
      });

      return movesToMovesByPlayerId(moves);
   }
}
