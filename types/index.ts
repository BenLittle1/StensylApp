// types/index.ts
export interface SessionData {
  id: string;          // A unique identifier for the session (e.g., a timestamp string)
  subject: string;       // The subject the user studied
  duration: number;      // The length of the study session in seconds
  notes?: string;        // Optional notes the user took about the session
  rating?: number;       // Optional productivity rating (e.g., 1-5)
  completedAt: string;   // An ISO string representing when the session was completed
}

// If you have other shared types or interfaces in the future,
// you can add them here as well.