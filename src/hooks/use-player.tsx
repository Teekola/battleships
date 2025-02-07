import { useCallback, useEffect, useState } from "react";

import { generatePlayerId } from "@/utils/generatePlayerId";

const PLAYER_ID_KEY = "playerId";
const PLAYER_NAME_KEY = "playerName";

export function usePlayer() {
   const [playerId, setPlayerId] = useState<string | null>(null);
   const [hasHydrated, setHasHydrated] = useState(false);
   const [playerName, setPlayerName] = useState<string | null>(null);

   useEffect(() => {
      const storedPlayerId = localStorage.getItem(PLAYER_ID_KEY);
      const storedPlayerName = localStorage.getItem(PLAYER_NAME_KEY);

      if (storedPlayerName) {
         setPlayerName(storedPlayerName);
      }

      if (storedPlayerId) {
         setPlayerId(storedPlayerId);
      } else {
         const newPlayerId = generatePlayerId();
         localStorage.setItem(PLAYER_ID_KEY, newPlayerId);
         setPlayerId(newPlayerId);
      }
      setHasHydrated(true);
   }, []);

   const updatePlayerName = useCallback((name: string) => {
      setPlayerName(name);
      localStorage.setItem(PLAYER_NAME_KEY, name);
   }, []);

   if (hasHydrated) {
      return { playerId: playerId as string, playerName, updatePlayerName, hasHydrated };
   }

   return { playerId: null, playerName, updatePlayerName, hasHydrated };
}
