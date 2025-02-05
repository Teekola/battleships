import { ShipType, shipSizes } from "@/app/create-game/create-game-form-schema";

export interface Coordinates {
   x: number;
   y: number;
}
export type ShipPieceType = "start" | "mid" | "end";
export type ShipOrientation = "horizontal" | "vertical";

export type BoardWithShips = BoardCell[][];
export type BoardCell =
   | {
        x: number;
        y: number;
        isShip: true;
        shipId: string;
        shipSize: number;
        shipOrientation: ShipOrientation;
        shipPiece: ShipPieceType;
     }
   | { x: number; y: number; isShip: false };

export type BoardWithShipsAndHits = GameBoardCell[][];

export type GameBoardCell =
   | {
        x: number;
        y: number;
        isHit: boolean;
        isShip: false;
     }
   | {
        x: number;
        y: number;
        isHit: boolean;
        isSunk: boolean;
        isShip: true;
        shipId: string;
        shipSize: number;
        shipOrientation: ShipOrientation;
        shipPiece: ShipPieceType;
     };

export type Move = {
   x: number;
   y: number;
};

export type HoveredCells = {
   canPlace: boolean;
   coordinates: HoveredCell[];
};

export interface HoveredCell extends Coordinates {
   isOccupied: boolean;
}

export type PlacedShip = {
   id?: number;
   shipId: string;
   shipType: ShipType;
   coordinates: Coordinates;
   size: number;
   orientation: ShipOrientation;
};

export type ShipAmounts = typeof shipSizes;
