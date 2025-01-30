"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { PlayerNameFormData, formSchema } from "./player-name-schema";

export function PlayerNameForm({ gameId }: Readonly<{ gameId: string }>) {
   const router = useRouter();
   const form = useForm<PlayerNameFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
      },
   });

   function onSubmit(data: PlayerNameFormData) {
      console.log(data);
      // TODO: Check if there is already a player, if so, go directly to the game start stage!
      router.push(`/game/${gameId}/invite`);
   }

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-xs flex-col justify-between gap-4"
         >
            <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Name</FormLabel>
                     <FormControl>
                        <Input {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <Button type="submit">Enter Game</Button>
         </form>
      </Form>
   );
}
