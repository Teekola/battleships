import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { GameStoreProvider } from "./game/[gameId]/(stores)/game-store-provider";
import "./globals.css";

const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Battleships",
   description: "A simple battleships game. Play now! 🚢",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body
            className={`${geistSans.variable} h-screen min-h-screen bg-background font-sans antialiased`}
         >
            <GameStoreProvider>{children}</GameStoreProvider>
         </body>
      </html>
   );
}
