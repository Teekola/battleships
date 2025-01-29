import { BackButtonLink } from "@/components/ui/back-button-link";

import { CreateGameForm } from "./create-game-form";

export default function CreateGamePage() {
   return (
      <>
         <div className="mx-auto max-w-xl px-4 py-2">
            <BackButtonLink href="/" label="Back" />
         </div>
         <div className="flex h-[calc(100%-52px)] flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-2xl font-bold">Create Game</h1>
            <CreateGameForm />
         </div>
      </>
   );
}
