import { BackButtonLink } from "@/components/ui/back-button-link";

import { CreateGameForm } from "./create-game-form";

export default function CreateGamePage() {
   return (
      <div className="mx-auto flex max-w-lg flex-col gap-4">
         <BackButtonLink href="/" label="Back" />
         <h1 className="text-2xl font-bold">Create Game</h1>
         <CreateGameForm />
      </div>
   );
}
