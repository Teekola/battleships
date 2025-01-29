"use client";

import { z } from "zod";

export const formSchema = z.object({
   gameId: z.string().min(6),
});

export type JoinGameFormData = z.infer<typeof formSchema>;
