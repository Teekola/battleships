"use client";

import { ComponentProps } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { MinusIcon, PlusIcon } from "lucide-react";
import { FieldValues, Path, useForm, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/select";

import {
   CreateGameFormData,
   formSchema,
   shipAmountOptionsByShipType,
} from "./create-game-form-schema";

export function CreateGameForm() {
   // 1. Define your form.
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

   // 2. Define a submit handler.
   function onSubmit(values: CreateGameFormData) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      console.log(values);
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-72 flex-col gap-4">
            <NumberSelectInput<CreateGameFormData>
               className="mb-8"
               name="boardSize"
               label="Board size"
               options={[5, 6, 7, 8, 9, 10]}
            />
            <section className="flex flex-col gap-2">
               <h2 className="font-bold">Ships</h2>
               <NumberSelectInput<CreateGameFormData>
                  name="nCarrier"
                  label="Carriers"
                  options={shipAmountOptionsByShipType.carrier}
               />
               <NumberSelectInput<CreateGameFormData>
                  name="nBattleship"
                  label="Battleships"
                  options={shipAmountOptionsByShipType.battleship}
               />
               <NumberSelectInput<CreateGameFormData>
                  name="nCruiser"
                  label="Cruisers"
                  options={shipAmountOptionsByShipType.cruiser}
               />
               <NumberSelectInput<CreateGameFormData>
                  name="nSubmarine"
                  label="Submarines"
                  options={shipAmountOptionsByShipType.submarine}
               />
               <NumberSelectInput<CreateGameFormData>
                  name="nDestroyer"
                  label="Destroyers"
                  options={shipAmountOptionsByShipType.destroyer}
               />
            </section>

            <Button type="submit">Create</Button>
         </form>
      </Form>
   );
}

interface NumberSelectInputProps<T> extends ComponentProps<typeof FormItem> {
   name: Path<T>;
   label: string;
   options: number[];
}
function NumberSelectInput<T extends FieldValues>({
   name,
   options,
   label,
   ...props
}: Readonly<NumberSelectInputProps<T>>) {
   const form = useFormContext<T>();

   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem {...props} className={cn(props.className && props.className)}>
               <div className="flex items-center gap-2">
                  <FormLabel className="w-full max-w-28">{label}</FormLabel>
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
               </div>
            </FormItem>
         )}
      />
   );
}
