import { getSessions } from '@/services/storage';
import { SessionData } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export default function useSessions() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSessions(await getSessions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(); // load on mount
  }, [refresh]);

  return { sessions, refresh, isLoading };
}
