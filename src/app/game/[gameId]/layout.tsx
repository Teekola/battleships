import { PropsWithChildren } from "react";

import { MuteButton } from "./(components)/mute-button";

export default async function GameLayout({ children }: Readonly<PropsWithChildren>) {
   return (
      <div className="mx-auto h-[calc(100%-256px)] max-w-5xl p-2">
         <MuteButton />

         {children}
      </div>
   );
}
