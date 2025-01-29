"use client";

import { z } from "zod";

export const formSchema = z.object({
   name: z.string().min(1),
});

export type PlayerNameFormData = z.infer<typeof formSchema>;
