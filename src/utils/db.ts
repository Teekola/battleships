import { GameDB } from "./game-db";
import { MoveDB } from "./move-db";
import { PlacedShipDB } from "./placed-ship-db";

const globalForDB = global as unknown as { db: DB };

class DB {
   public game: GameDB;
   public placedShip: PlacedShipDB;
   public move: MoveDB;
   private static client: DB;

   private constructor() {
      this.game = new GameDB();
      this.placedShip = new PlacedShipDB();
      this.move = new MoveDB();
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
