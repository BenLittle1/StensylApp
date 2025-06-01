// utils/formatters.ts
export const formatTime = (totalSeconds: number): string => {
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds =  totalSeconds % 60;

  // HH:MM:SS, zero-padded
  return `${String(hours).padStart(2, '0')}:` +
         `${String(minutes).padStart(2, '0')}:` +
         `${String(seconds).padStart(2, '0')}`;
};
