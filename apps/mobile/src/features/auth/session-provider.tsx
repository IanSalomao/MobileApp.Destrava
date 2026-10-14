import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { onSessionChange } from './api';

type SessionContextValue = {
  session: Session | null;
  /** true até o Supabase terminar de ler a sessão salva no aparelho. */
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(
    () =>
      onSessionChange((nextSession) => {
        setSession(nextSession);
        setIsLoading(false);
      }),
    [],
  );

  return <SessionContext value={{ session, isLoading }}>{children}</SessionContext>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession precisa estar dentro de <SessionProvider>.');
  }
  return context;
}
