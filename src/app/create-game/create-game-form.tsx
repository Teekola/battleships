"use client";

import { ComponentProps, PropsWithChildren, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { GameMode } from "@prisma/client";
import { MinusIcon, PlusIcon } from "lucide-react";
import { FieldValues, Path, useForm, useFormContext } from "react-hook-form";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/select";

import { createGame } from "./actions";
import {
   CreateGameFormData,
   ShipType,
   boardSizeOptions,
   formSchema,
   shipAmountOptionsByShipType,
   shipSizes,
} from "./create-game-form-schema";

export function CreateGameForm() {
   const router = useRouter();
   const form = useForm<CreateGameFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         gameMode: GameMode.CLASSIC,
         boardSize: 8,
         carriers: 1,
         battleships: 1,
         cruisers: 1,
         submarines: 1,
         destroyers: 1,
      },
   });
   const { playerId, hasHydrated } = usePlayer();
   const [isSubmitting, setIsSubmitting] = useState(false);

   async function onSubmit(data: CreateGameFormData) {
      if (!hasHydrated) return;
      setIsSubmitting(true);
      const gameId = await createGame({ ...data, player1Id: playerId });
      router.push(`/game/${gameId}/join`);
   }

   if (!hasHydrated) return null;

   if (isSubmitting) {
      return <p>Creating game...</p>;
   }

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-xs flex-col justify-between gap-4"
         >
            <section className="flex flex-col gap-8">
               <FormField
                  control={form.control}
                  name="gameMode"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Game Mode</FormLabel>
                        <div className="flex w-full flex-row items-center justify-between gap-2 rounded-lg">
                           <FormControl>
                              <Button
                                 className={cn(
                                    "w-full",
                                    field.value === GameMode.CLASSIC && "border border-primary"
                                 )}
                                 type="button"
                                 onClick={() => form.setValue("gameMode", GameMode.CLASSIC)}
                                 variant={field.value === GameMode.CLASSIC ? "default" : "outline"}
                              >
                                 Classic
                              </Button>
                           </FormControl>
                           <FormControl>
                              <Button
                                 className={cn(
                                    "w-full",
                                    field.value === GameMode.RAMPAGE && "border border-primary"
                                 )}
                                 type="button"
                                 onClick={() => form.setValue("gameMode", GameMode.RAMPAGE)}
                                 variant={field.value === GameMode.RAMPAGE ? "default" : "outline"}
                              >
                                 Rampage
                              </Button>
                           </FormControl>
                        </div>
                        <FormDescription>
                           {field.value === GameMode.CLASSIC
                              ? "Classic rules. Each player can hit once every round."
                              : "Extended rules. You can hit again after a hit!"}
                        </FormDescription>
                     </FormItem>
                  )}
               />
               <div className="flex flex-col gap-2">
                  <Label>Board Size</Label>
                  <NumberSelectInput<CreateGameFormData>
                     className="mb-8"
                     name="boardSize"
                     options={boardSizeOptions}
                  />
               </div>
            </section>
            <section className="flex flex-col gap-2">
               <h2 className="font-bold">Ships</h2>
               <ShipAmountInput<CreateGameFormData>
                  name="carriers"
                  label="Carriers"
                  shipType="carrier"
                  options={shipAmountOptionsByShipType.carrier}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="battleships"
                  label="Battleships"
                  shipType="battleship"
                  options={shipAmountOptionsByShipType.battleship}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="cruisers"
                  label="Cruisers"
                  shipType="cruiser"
                  options={shipAmountOptionsByShipType.cruiser}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="submarines"
                  label="Submarines"
                  shipType="submarine"
                  options={shipAmountOptionsByShipType.submarine}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="destroyers"
                  label="Destroyers"
                  shipType="destroyer"
                  options={shipAmountOptionsByShipType.destroyer}
               />
            </section>
            <RootError />
            <Button type="submit">Create</Button>
         </form>
      </Form>
   );
}

function RootError() {
   const form = useFormContext();
   const message = form.formState.errors[""]?.message;

   if (!message) return null;
   return <p className="text-sm text-red-500">{message + ""}</p>;
}

interface ShipAmountInputProps<T> extends NumberSelectInputProps<T> {
   label: string;
   shipType: ShipType;
}

function Label({ children, ...props }: Readonly<PropsWithChildren<ComponentProps<"p">>>) {
   return (
      <p className={cn("text-sm font-medium", props.className && props.className)}>{children}</p>
   );
}

function ShipAmountInput<T extends FieldValues>({
   name,
   options,
   shipType,
   label,
   ...props
}: ShipAmountInputProps<T>) {
   return (
      <div className="flex items-center gap-2">
         <div className="flex w-full flex-wrap items-center gap-2 xs:flex-nowrap">
            <Label className="w-full">{label}</Label>
            <div className="flex gap-1">
               {Array.from({ length: shipSizes[shipType] }).map((_, i) => (
                  <div key={i} className="h-2 w-2 bg-gray-500"></div>
               ))}
            </div>
         </div>
         <NumberSelectInput<T> {...props} name={name} options={options} />
      </div>
   );
}

interface NumberSelectInputProps<T> extends ComponentProps<typeof FormItem> {
   name: Path<T>;
   options: number[];
}

function NumberSelectInput<T extends FieldValues>({
   name,
   options,
   ...props
}: Readonly<NumberSelectInputProps<T>>) {
   const form = useFormContext<T>();

   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem {...props} className={cn(props.className && props.className)}>
               <div className="flex items-center gap-1">
                  <FormControl>
                     <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="min-h-9 min-w-9"
                        disabled={field.value - 1 < options[0]}
                        onClick={() => field.onChange(field.value - 1)}
                     >
                        <MinusIcon />
                     </Button>
                  </FormControl>

                  <Select
                     onValueChange={(value) => field.onChange(Number(value))}
                     value={field.value + ""}
                  >
                     <SelectTrigger className="max-w-18 min-w-20">{field.value}</SelectTrigger>
                     <SelectContent>
                        {options.map((option) => (
                           <SelectItem key={option} value={option + ""}>
                              {option}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>

                  <FormControl>
                     <Button
                        type="button"
                        className="min-h-9 min-w-9"
                        variant="outline"
                        size="icon"
                        disabled={field.value + 1 > options[options.length - 1]}
                        onClick={() => field.onChange(field.value + 1)}
                     >
                        <PlusIcon />
                     </Button>
                  </FormControl>
               </div>
            </FormItem>
         )}
      />
   );
}
