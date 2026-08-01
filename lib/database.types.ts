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
      posts: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          content: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          content?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          content?: string | null;
          category?: string | null;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: number;
          post_id: number;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          post_id: number;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          post_id?: number;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
}
