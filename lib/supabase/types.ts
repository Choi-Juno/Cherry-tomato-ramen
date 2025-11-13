/**
 * Database type definitions for Supabase
 * These types are generated from the database schema
 * 
 * To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          notification_enabled: boolean;
          notification_tone: "coach" | "friend";
          currency: string;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_enabled?: boolean;
          notification_tone?: "coach" | "friend";
          currency?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_enabled?: boolean;
          notification_tone?: "coach" | "friend";
          currency?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          label_ko: string;
          label_en: string;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          label_ko: string;
          label_en: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          label_ko?: string;
          label_en?: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          payment_method: string;
          merchant: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          payment_method: string;
          merchant?: string | null;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          category?: string;
          payment_method?: string;
          merchant?: string | null;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          amount: number;
          month: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          amount: number;
          month: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          amount?: number;
          month?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          severity: string;
          title: string;
          description: string;
          suggested_action: string | null;
          potential_savings: number | null;
          category: string | null;
          metadata: Json | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          severity: string;
          title: string;
          description: string;
          suggested_action?: string | null;
          potential_savings?: number | null;
          category?: string | null;
          metadata?: Json | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          severity?: string;
          title?: string;
          description?: string;
          suggested_action?: string | null;
          potential_savings?: number | null;
          category?: string | null;
          metadata?: Json | null;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      challenges: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string | null;
          target_amount: number;
          current_amount: number;
          start_date: string;
          end_date: string;
          status: string;
          reward_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category?: string | null;
          target_amount: number;
          current_amount?: number;
          start_date: string;
          end_date: string;
          status?: string;
          reward_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string | null;
          target_amount?: number;
          current_amount?: number;
          start_date?: string;
          end_date?: string;
          status?: string;
          reward_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

