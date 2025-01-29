"use client";

import { ComponentProps, PropsWithChildren } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { MinusIcon, PlusIcon } from "lucide-react";
import { FieldValues, Path, useForm, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/select";

import {
   CreateGameFormData,
   ShipType,
   boardSizeOptions,
   formSchema,
   shipAmountOptionsByShipType,
   shipSizes,
} from "./create-game-form-schema";

export function CreateGameForm() {
   const form = useForm<CreateGameFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         boardSize: 8,
         nCarrier: 1,
         nBattleship: 1,
         nCruiser: 1,
         nSubmarine: 1,
         nDestroyer: 1,
      },
   });

   function onSubmit(values: CreateGameFormData) {
      console.log(values);
   }

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-xs flex-col justify-between gap-4"
         >
            <section className="flex flex-col gap-2">
               <Label>Board Size</Label>
               <NumberSelectInput<CreateGameFormData>
                  className="mb-8"
                  name="boardSize"
                  options={boardSizeOptions}
               />
            </section>
            <section className="flex flex-col gap-2">
               <h2 className="font-bold">Ships</h2>
               <ShipAmountInput<CreateGameFormData>
                  name="nCarrier"
                  label="Carriers"
                  shipType="carrier"
                  options={shipAmountOptionsByShipType.carrier}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="nBattleship"
                  label="Battleships"
                  shipType="battleship"
                  options={shipAmountOptionsByShipType.battleship}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="nCruiser"
                  label="Cruisers"
                  shipType="cruiser"
                  options={shipAmountOptionsByShipType.cruiser}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="nSubmarine"
                  label="Submarines"
                  shipType="submarine"
                  options={shipAmountOptionsByShipType.submarine}
               />
               <ShipAmountInput<CreateGameFormData>
                  name="nDestroyer"
                  label="Destroyers"
                  shipType="destroyer"
                  options={shipAmountOptionsByShipType.destroyer}
               />
            </section>

            <Button type="submit">Create</Button>
         </form>
      </Form>
   );
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
