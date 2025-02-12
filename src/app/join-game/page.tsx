import { BackButtonLink } from "@/components/ui/back-button-link";

import { JoinGameForm } from "./join-game-form";

export default function JoinGamePage() {
   return (
      <>
         <div className="mx-auto max-w-xl px-4 py-2">
            <BackButtonLink href="/" label="Back" />
         </div>
         <div className="flex h-[calc(100%-256px)] flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-2xl font-bold">Join Game</h1>
            <JoinGameForm />
         </div>
      </>
   );
}
