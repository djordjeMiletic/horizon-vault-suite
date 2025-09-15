import { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/services/auth";
import type { UserSession } from "@/types/api";

type Session = UserSession | null;
const Ctx = createContext<{ user: Session; setUser: (u: Session) => void }>({ user: null, setUser: () => {} });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session>(null);
  
  useEffect(() => { 
    getSession().then(setUser).catch(() => setUser(null)); 
  }, []);
  
  return <Ctx.Provider value={{ user, setUser }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);