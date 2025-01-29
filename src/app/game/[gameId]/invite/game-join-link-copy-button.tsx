"use client";

import { useParams } from "next/navigation";

import { CopyIcon } from "lucide-react";

import { Button } from "@/ui/button";

export function GameJoinLinkCopyButton() {
   const { gameId } = useParams();

   function copy() {
      const gameJoinLink = `${location.origin}/game/${gameId}/join`;
      navigator.clipboard.writeText(gameJoinLink);
   }

   return (
      <Button variant="ghost" onClick={copy}>
         Copy Game Join Link <CopyIcon />
      </Button>
   );
}
