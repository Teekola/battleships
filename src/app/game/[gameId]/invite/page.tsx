import { GameJoinLinkCopyButton } from "./game-join-link-copy-button";

export default async function InviteToGamePage({
   params,
}: Readonly<{ params: Promise<{ gameId: string }> }>) {
   const gameId = (await params).gameId;
   return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
         <h1 className="text-2xl font-bold">Invite a Player!</h1>
         <p>Game ID</p>
         <p className="group inline-flex items-center gap-4 text-4xl font-bold">{gameId}</p>

         <GameJoinLinkCopyButton />
      </div>
   );
}
