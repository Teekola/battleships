import { NextResponse } from "next/server";

import { db } from "@/utils/db";

export async function GET(req: Request) {
   if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
   }
   const result = await db.game.cleanUpDatabase();
   if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
   }

   return NextResponse.json({ message: result.message }, { status: 500 });
}
