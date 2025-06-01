import { getSessions } from '@/services/storage';
import { SessionData } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export default function useSessions() {
  const [sessions, setSessions] = useState<SessionData[]>([]);

  const refresh = useCallback(async () => {
    setSessions(await getSessions());
  }, []);

  useEffect(() => {
    refresh();           // load on mount
  }, [refresh]);

  return { sessions, refresh };
}
