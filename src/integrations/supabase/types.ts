export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_rtl: boolean
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_rtl?: boolean
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_rtl?: boolean
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          category: string
          created_at: string
          english_meaning: string
          id: string
          kashmiri_text: string
          submitted_by: string | null
          submitted_by_name: string | null
          verified: boolean
        }
        Insert: {
          category?: string
          created_at?: string
          english_meaning: string
          id?: string
          kashmiri_text: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          verified?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          english_meaning?: string
          id?: string
          kashmiri_text?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      edu_glossary: {
        Row: {
          created_at: string
          grade_band: string
          id: string
          subject: string
          term_en: string
          term_ks: string
          term_ur: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          grade_band?: string
          id?: string
          subject?: string
          term_en: string
          term_ks?: string
          term_ur?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          grade_band?: string
          id?: string
          subject?: string
          term_en?: string
          term_ks?: string
          term_ur?: string
          verified?: boolean
        }
        Relationships: []
      }
      feedback: {
        Row: {
          correction_text: string | null
          created_at: string
          id: string
          message_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          correction_text?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          correction_text?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string
          content_english: string
          content_kashmiri: string
          content_urdu: string
          created_at: string
          embedding: string | null
          id: string
          source: string | null
          title: string
        }
        Insert: {
          category?: string
          content_english?: string
          content_kashmiri?: string
          content_urdu?: string
          created_at?: string
          embedding?: string | null
          id?: string
          source?: string | null
          title: string
        }
        Update: {
          category?: string
          content_english?: string
          content_kashmiri?: string
          content_urdu?: string
          created_at?: string
          embedding?: string | null
          id?: string
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      lesson_corrections: {
        Row: {
          concept: string
          created_at: string
          id: string
          kind: string
          note: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          concept?: string
          created_at?: string
          id?: string
          kind: string
          note?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          concept?: string
          created_at?: string
          id?: string
          kind?: string
          note?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_corrections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lesson_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_sessions: {
        Row: {
          concepts: Json
          created_at: string
          difficulty: string
          grade: number
          id: string
          objective: string
          prerequisites: Json
          quiz: Json
          results: Json
          source_text: string
          subject: string
          target_language: string
          title: string
          user_id: string
          weak_concepts: Json
        }
        Insert: {
          concepts?: Json
          created_at?: string
          difficulty?: string
          grade?: number
          id?: string
          objective?: string
          prerequisites?: Json
          quiz?: Json
          results?: Json
          source_text?: string
          subject?: string
          target_language?: string
          title?: string
          user_id: string
          weak_concepts?: Json
        }
        Update: {
          concepts?: Json
          created_at?: string
          difficulty?: string
          grade?: number
          id?: string
          objective?: string
          prerequisites?: Json
          quiz?: Json
          results?: Json
          source_text?: string
          subject?: string
          target_language?: string
          title?: string
          user_id?: string
          weak_concepts?: Json
        }
        Relationships: []
      }
      local_examples: {
        Row: {
          body_en: string
          concept_key: string
          created_at: string
          grade_band: string
          id: string
          region: string
          subject: string
          title: string
        }
        Insert: {
          body_en: string
          concept_key: string
          created_at?: string
          grade_band?: string
          id?: string
          region?: string
          subject?: string
          title: string
        }
        Update: {
          body_en?: string
          concept_key?: string
          created_at?: string
          grade_band?: string
          id?: string
          region?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      translation_pairs: {
        Row: {
          created_at: string
          domain: string
          embedding: string | null
          en: string
          id: string
          ks: string
          source: string
        }
        Insert: {
          created_at?: string
          domain?: string
          embedding?: string | null
          en: string
          id?: string
          ks: string
          source?: string
        }
        Update: {
          created_at?: string
          domain?: string
          embedding?: string | null
          en?: string
          id?: string
          ks?: string
          source?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      match_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          content_english: string
          content_kashmiri: string
          content_urdu: string
          id: string
          similarity: number
          title: string
        }[]
      }
      match_translation_pairs: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          domain: string
          en: string
          id: string
          ks: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
