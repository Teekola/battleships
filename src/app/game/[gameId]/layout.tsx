import { PropsWithChildren } from "react";

import { MuteButton } from "./(components)/mute-button";

export default async function GameLayout({ children }: Readonly<PropsWithChildren>) {
   return (
      <div className="mx-auto max-w-5xl p-2">
         <div>
            <MuteButton />
         </div>
         {children}
      </div>
   );
}
