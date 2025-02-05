import { cn } from "@/lib/utils";

export function ShipCatalogueItem({ size }: Readonly<{ size: number }>) {
   return (
      <div className="flex w-fit items-center justify-start gap-1">
         {Array.from({ length: size }).map((v, i) => (
            <div
               key={i}
               className={cn(
                  "h-8 w-8 bg-slate-500",
                  "first-of-type:rounded-l-full last-of-type:rounded-r-full"
               )}
            ></div>
         ))}
      </div>
   );
}
