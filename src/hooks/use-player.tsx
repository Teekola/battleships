import { useCallback, useEffect, useState } from "react";

import { generatePlayerId } from "@/utils/generatePlayerId";

const PLAYER_ID_KEY = "playerId";
const PLAYER_NAME_KEY = "playerName";

export function usePlayer() {
   const [playerId, setPlayerId] = useState<string>("");
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
   }, []);

   const updatePlayerName = useCallback((name: string) => {
      setPlayerName(name);
      localStorage.setItem(PLAYER_NAME_KEY, name);
   }, []);

   return { playerId, playerName, updatePlayerName };
}
