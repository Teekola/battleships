import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
   return (
      <div className="mx-auto flex h-full max-w-screen-xs flex-col justify-center">
         <div className="flex flex-col">
            <header className="mb-4">
               <h1 className="text-3xl font-bold">Teekola&apos;s Battleships</h1>
            </header>
            <ul className="flex flex-col gap-2">
               <li>
                  <Button asChild className="w-full">
                     <Link href="/create-game">Create Game</Link>
                  </Button>
               </li>
               <li>
                  <Button asChild className="w-full">
                     <Link href="/join-game">Join Game</Link>
                  </Button>
               </li>
            </ul>
         </div>
      </div>
   );
}
