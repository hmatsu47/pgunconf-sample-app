export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: number;
          update_at: Date;
          title: string;
          note?: string | null;
          note_type: number;
          userid: string;
        }; // The data expected to be returned from a "select" statement.
        Insert: {
          updated_at: Date;
          title: string;
          note?: string | null;
          note_type: number;
          userid: string;
        }; // The data expected passed to an "insert" statement.
        Update: {
          updated_at: Date;
          title: string;
          note?: string | null;
          note_type: number;
          userid: string;
        }; // The data expected passed to an "update" statement.
      };
      authors: {
        Row: {
          id: number;
          updated_at: Date;
          userid: string;
        }; // The data expected to be returned from a "select" statement.
        Insert: {
          id: number;
          updated_at: Date;
          userid: string;
        }; // The data expected passed to an "insert" statement.
        Update: {
          id: number;
          updated_at: Date;
          userid: string;
        }; // The data expected passed to an "update" statement.
      };
      privates: {
        Row: {
          userid: string;
          secret_note: string;
          updated_at: Date;
        }; // The data expected to be returned from a "select" statement.
        Insert: {
          userid: string;
          secret_note: string;
          updated_at: Date;
        }; // The data expected passed to an "insert" statement.
        Update: {
          userid: string;
          secret_note: string;
          updated_at: Date;
        }; // The data expected passed to an "update" statement.
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          website?: string | null;
          avatar_url?: string | null;
          updated_at: Date;
        }; // The data expected to be returned from a "select" statement.
        Insert: {
          id: string;
          username: string;
          website?: string | null;
          avatar_url?: string | null;
          updated_at: Date;
        }; // The data expected passed to an "insert" statement.
        Update: {
          id: string;
          username: string;
          website?: string | null;
          avatar_url?: string | null;
          updated_at: Date;
        }; // The data expected passed to an "update" statement.
      };
    };
    Views: {
      decrypted_privates: {
        Row: {
          decrypted_secret_note: string;
          userid: string;
          note_id: number;
        }; // The data expected to be returned from a "select" statement.
        Insert: {
          decrypted_secret_note: string;
          userid: string;
          note_id: number;
        }; // The data expected passed to an "insert" statement.
        Update: {
          decrypted_secret_note: string;
          userid: string;
          note_id: number;
        }; // The data expected passed to an "update" statement.
      };
    };
  };
}
