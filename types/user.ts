export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notification_enabled: boolean;
  notification_tone: "coach" | "friend";
  currency: string;
  language: string;
  created_at: string;
  updated_at: string;
}

