import { PropsWithChildren } from "react";

export default async function GameLayout({ children }: Readonly<PropsWithChildren>) {
   return <div className="mx-auto max-w-5xl p-2">{children}</div>;
}
