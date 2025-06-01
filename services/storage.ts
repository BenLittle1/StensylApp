import { SESSIONS_STORAGE_KEY } from '@/constants/storage';
import { SessionData } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getSessions = async (): Promise<SessionData[]> => {
  const raw = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveSession = async (session: SessionData) => {
  const sessions = await getSessions();
  await AsyncStorage.setItem(
    SESSIONS_STORAGE_KEY,
    JSON.stringify([session, ...sessions])
  );
};
