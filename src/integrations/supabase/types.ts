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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      collection_items: {
        Row: {
          collection_id: string | null
          created_at: string
          id: string
          notes: string | null
          outfit_id: string | null
          wardrobe_item_id: string | null
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          outfit_id?: string | null
          wardrobe_item_id?: string | null
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          outfit_id?: string | null
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emotes: {
        Row: {
          category: string | null
          created_at: string
          emoji: string
          id: string
          is_premium: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          emoji: string
          id?: string
          is_premium?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          emoji?: string
          id?: string
          is_premium?: boolean | null
          name?: string
        }
        Relationships: []
      }
      laundry_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          name: string | null
          notes: string | null
          started_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      laundry_items: {
        Row: {
          added_at: string
          batch_id: string | null
          id: string
          wardrobe_item_id: string | null
        }
        Insert: {
          added_at?: string
          batch_id?: string | null
          id?: string
          wardrobe_item_id?: string | null
        }
        Update: {
          added_at?: string
          batch_id?: string | null
          id?: string
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laundry_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "laundry_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laundry_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_profile_access_log: {
        Row: {
          accessed_fields: string[] | null
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          merchant_profile_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_fields?: string[] | null
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          merchant_profile_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_fields?: string[] | null
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          merchant_profile_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      merchant_profiles: {
        Row: {
          business_address: Json | null
          business_name: string
          business_type: string | null
          contact_info: Json | null
          created_at: string
          id: string
          tax_id: string | null
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          business_address?: Json | null
          business_name: string
          business_type?: string | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          tax_id?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          business_address?: Json | null
          business_name?: string
          business_type?: string | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      outfit_items: {
        Row: {
          created_at: string
          id: string
          item_type: string | null
          outfit_id: string | null
          wardrobe_item_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_type?: string | null
          outfit_id?: string | null
          wardrobe_item_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string | null
          outfit_id?: string | null
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          ai_generation_prompt: string | null
          created_at: string
          id: string
          is_ai_generated: boolean | null
          is_favorite: boolean | null
          name: string | null
          notes: string | null
          occasion: string | null
          photos: Json | null
          season: string | null
          updated_at: string
          user_id: string
          weather_conditions: Json | null
        }
        Insert: {
          ai_generation_prompt?: string | null
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          is_favorite?: boolean | null
          name?: string | null
          notes?: string | null
          occasion?: string | null
          photos?: Json | null
          season?: string | null
          updated_at?: string
          user_id: string
          weather_conditions?: Json | null
        }
        Update: {
          ai_generation_prompt?: string | null
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          is_favorite?: boolean | null
          name?: string | null
          notes?: string | null
          occasion?: string | null
          photos?: Json | null
          season?: string | null
          updated_at?: string
          user_id?: string
          weather_conditions?: Json | null
        }
        Relationships: []
      }
      professional_applications: {
        Row: {
          application_status: string | null
          experience_years: number | null
          id: string
          portfolio_url: string | null
          qualifications: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          social_verification: Json | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          application_status?: string | null
          experience_years?: number | null
          id?: string
          portfolio_url?: string | null
          qualifications?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          social_verification?: Json | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          application_status?: string | null
          experience_years?: number | null
          id?: string
          portfolio_url?: string | null
          qualifications?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          social_verification?: Json | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_level: Database["public"]["Enums"]["auth_level"]
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_profile_public: boolean | null
          location: string | null
          privacy_settings: Json | null
          role: Database["public"]["Enums"]["user_role"]
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          style_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_level?: Database["public"]["Enums"]["auth_level"]
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_profile_public?: boolean | null
          location?: string | null
          privacy_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          style_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_level?: Database["public"]["Enums"]["auth_level"]
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_profile_public?: boolean | null
          location?: string | null
          privacy_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          style_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          emote_id: string | null
          id: string
          reaction_type: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emote_id?: string | null
          id?: string
          reaction_type?: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          emote_id?: string | null
          id?: string
          reaction_type?: string | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_emote_id_fkey"
            columns: ["emote_id"]
            isOneToOne: false
            referencedRelation: "emotes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          app_behavior: Json | null
          created_at: string
          id: string
          language: string | null
          notifications: Json | null
          privacy_settings: Json | null
          suggestion_settings: Json | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_behavior?: Json | null
          created_at?: string
          id?: string
          language?: string | null
          notifications?: Json | null
          privacy_settings?: Json | null
          suggestion_settings?: Json | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_behavior?: Json | null
          created_at?: string
          id?: string
          language?: string | null
          notifications?: Json | null
          privacy_settings?: Json | null
          suggestion_settings?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_name: string | null
          price: number | null
          provider_id: string
          started_at: string
          status: string | null
          subscriber_id: string
          subscription_type: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name?: string | null
          price?: number | null
          provider_id: string
          started_at?: string
          status?: string | null
          subscriber_id: string
          subscription_type: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name?: string | null
          price?: number | null
          provider_id?: string
          started_at?: string
          status?: string | null
          subscriber_id?: string
          subscription_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      wardrobe_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          condition: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          last_worn: string | null
          location_in_wardrobe: string | null
          material: string | null
          name: string
          notes: string | null
          occasion: string | null
          photos: Json | null
          purchase_date: string | null
          purchase_price: number | null
          season: string | null
          size: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          wardrobe_id: string | null
          wear_count: number | null
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          last_worn?: string | null
          location_in_wardrobe?: string | null
          material?: string | null
          name: string
          notes?: string | null
          occasion?: string | null
          photos?: Json | null
          purchase_date?: string | null
          purchase_price?: number | null
          season?: string | null
          size?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          wardrobe_id?: string | null
          wear_count?: number | null
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          last_worn?: string | null
          location_in_wardrobe?: string | null
          material?: string | null
          name?: string
          notes?: string | null
          occasion?: string | null
          photos?: Json | null
          purchase_date?: string | null
          purchase_price?: number | null
          season?: string | null
          size?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          wardrobe_id?: string | null
          wear_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wardrobe_items_wardrobe_id_fkey"
            columns: ["wardrobe_id"]
            isOneToOne: false
            referencedRelation: "wardrobes"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobes: {
        Row: {
          created_at: string
          dimensions: Json | null
          id: string
          location: string | null
          name: string
          notes: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dimensions?: Json | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dimensions?: Json | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public_safe: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          style_score: number | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          style_score?: number | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          style_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_merchant_profile_public: {
        Args: { profile_user_id?: string }
        Returns: {
          business_name: string
          business_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verification_status: string
        }[]
      }
      get_merchant_profile_safe: {
        Args: Record<PropertyKey, never> | { profile_user_id: string }
        Returns: {
          business_name: string
          business_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verification_status: string
        }[]
      }
      get_merchant_sensitive_data: {
        Args: { profile_user_id?: string }
        Returns: {
          business_address: Json
          contact_info: Json
          tax_id: string
        }[]
      }
      get_merchant_sensitive_fields: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_address: Json
          contact_info: Json
          tax_id: string
        }[]
      }
      get_public_profile_by_user_id: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          style_score: number
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          style_score: number
          user_id: string
        }[]
      }
      log_merchant_sensitive_access: {
        Args: { accessed_fields: string[]; merchant_profile_id: string }
        Returns: boolean
      }
    }
    Enums: {
      auth_level: "base" | "intermediate" | "advanced"
      user_role: "private" | "professional" | "merchant" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      auth_level: ["base", "intermediate", "advanced"],
      user_role: ["private", "professional", "merchant", "admin"],
    },
  },
} as const
