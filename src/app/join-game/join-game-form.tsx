"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/ui/button";
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/ui/input-otp";

import { JoinGameFormData, formSchema } from "./join-game-form-schema";

export function JoinGameForm() {
   const form = useForm<JoinGameFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         gameId: "",
      },
   });

   // Autofocus the game id field
   useEffect(() => {
      form.setFocus("gameId");
   }, [form]);

   function onSubmit(values: JoinGameFormData) {
      console.log(values);
   }

   const canProceed = form.formState.isValid;

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-[288px] flex-col justify-between gap-4"
         >
            <FormField
               control={form.control}
               name="gameId"
               render={({ field }) => (
                  <FormItem className="mx-auto">
                     <div className="text-center">
                        <FormLabel className="text-lg">Game ID</FormLabel>
                     </div>
                     <FormControl>
                        <InputOTP maxLength={6} {...field}>
                           <InputOTPGroup>
                              <InputOTPSlot className="h-12 w-12 text-lg" index={0} />
                              <InputOTPSlot className="h-12 w-12 text-lg" index={1} />
                              <InputOTPSlot className="h-12 w-12 text-lg" index={2} />
                              <InputOTPSlot className="h-12 w-12 text-lg" index={3} />
                              <InputOTPSlot className="h-12 w-12 text-lg" index={4} />
                              <InputOTPSlot className="h-12 w-12 text-lg" index={5} />
                           </InputOTPGroup>
                        </InputOTP>
                     </FormControl>
                     <FormDescription>Enter a Game ID to join a game!</FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <Button type="submit" data-disabled={!canProceed}>
               Join
            </Button>
         </form>
      </Form>
   );
}
