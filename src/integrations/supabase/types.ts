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
      admin_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
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
      contact_info_access_log: {
        Row: {
          accessed_fields: string[] | null
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_fields?: string[] | null
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_fields?: string[] | null
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
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
      item_matches: {
        Row: {
          created_at: string
          id: string
          match_reasons: string[] | null
          match_score: number | null
          merchant_item_id: string
          status: string | null
          updated_at: string
          user_id: string
          user_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          merchant_item_id: string
          status?: string | null
          updated_at?: string
          user_id: string
          user_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          merchant_item_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          user_item_id?: string
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
      laundry_schedules: {
        Row: {
          auto_schedule: boolean | null
          created_at: string
          frequency_days: number
          id: string
          next_due_date: string
          schedule_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_schedule?: boolean | null
          created_at?: string
          frequency_days?: number
          id?: string
          next_due_date?: string
          schedule_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_schedule?: boolean | null
          created_at?: string
          frequency_days?: number
          id?: string
          next_due_date?: string
          schedule_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      merchant_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          condition: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          is_premium: boolean | null
          material: string | null
          merchant_id: string
          name: string
          occasion: string | null
          original_price: number | null
          photos: Json | null
          price: number
          season: string | null
          size: string[] | null
          stock_quantity: number | null
          style_tags: string[] | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean | null
          material?: string | null
          merchant_id: string
          name: string
          occasion?: string | null
          original_price?: number | null
          photos?: Json | null
          price: number
          season?: string | null
          size?: string[] | null
          stock_quantity?: number | null
          style_tags?: string[] | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean | null
          material?: string | null
          merchant_id?: string
          name?: string
          occasion?: string | null
          original_price?: number | null
          photos?: Json | null
          price?: number
          season?: string | null
          size?: string[] | null
          stock_quantity?: number | null
          style_tags?: string[] | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
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
          encryption_salt: string | null
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
          encryption_salt?: string | null
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
          encryption_salt?: string | null
          id?: string
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      mfa_rate_limits: {
        Row: {
          action: string
          attempt_count: number | null
          created_at: string | null
          id: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          action: string
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          action?: string
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          user_id?: string
          window_start?: string | null
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
      profile_contact_info: {
        Row: {
          created_at: string
          email: string | null
          id: string
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          updated_at?: string
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
          full_name: string | null
          id: string
          is_profile_public: boolean | null
          location: string | null
          privacy_settings: Json | null
          role: Database["public"]["Enums"]["user_role"]
          style_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_level?: Database["public"]["Enums"]["auth_level"]
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_profile_public?: boolean | null
          location?: string | null
          privacy_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          style_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_level?: Database["public"]["Enums"]["auth_level"]
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_profile_public?: boolean | null
          location?: string | null
          privacy_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          style_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
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
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      user_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          phone_number: string | null
          phone_verified: boolean | null
          totp_enabled: boolean | null
          totp_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          accessibility_settings: Json | null
          app_behavior: Json | null
          created_at: string
          extended_theme: Json | null
          id: string
          language: string | null
          laundry_settings: Json | null
          marketplace_settings: Json | null
          notifications: Json | null
          privacy_settings: Json | null
          suggestion_settings: Json | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_settings?: Json | null
          app_behavior?: Json | null
          created_at?: string
          extended_theme?: Json | null
          id?: string
          language?: string | null
          laundry_settings?: Json | null
          marketplace_settings?: Json | null
          notifications?: Json | null
          privacy_settings?: Json | null
          suggestion_settings?: Json | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_settings?: Json | null
          app_behavior?: Json | null
          created_at?: string
          extended_theme?: Json | null
          id?: string
          language?: string | null
          laundry_settings?: Json | null
          marketplace_settings?: Json | null
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
      [_ in never]: never
    }
    Functions: {
      check_contact_info_breach_patterns: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_suspicious_access: string
          suspicious_access_count: number
          user_id: string
        }[]
      }
      check_contact_rate_limit: {
        Args: { operation?: string }
        Returns: boolean
      }
      check_merchant_rate_limit: {
        Args: { operation: string }
        Returns: boolean
      }
      check_mfa_rate_limit: {
        Args: {
          action_type: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      create_invitation_admin: {
        Args: { invitation_email: string; invited_by_admin?: string }
        Returns: Json
      }
      create_sample_wardrobe_items: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decrypt_business_data: {
        Args: { business_salt?: string; encrypted_text: string }
        Returns: string
      }
      decrypt_contact_data: {
        Args: { encrypted_text: string; user_salt?: string }
        Returns: string
      }
      decrypt_mfa_secret: {
        Args: { encrypted_text: string; user_salt?: string }
        Returns: string
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      detect_bot_patterns: {
        Args: {
          ip_address?: unknown
          request_frequency?: number
          user_agent_string?: string
        }
        Returns: Json
      }
      detect_potential_data_breach: {
        Args: { access_count?: number; table_accessed: string }
        Returns: Json
      }
      encrypt_business_data: {
        Args: { business_salt?: string; data_text: string }
        Returns: string
      }
      encrypt_contact_data: {
        Args: { data_text: string; user_salt?: string }
        Returns: string
      }
      encrypt_mfa_secret: {
        Args: { secret_text: string; user_salt?: string }
        Returns: string
      }
      enhanced_rate_limit_check: {
        Args: {
          action_type: string
          identifier_key: string
          max_requests?: number
          user_agent_string?: string
          window_minutes?: number
        }
        Returns: Json
      }
      ensure_minimum_sample_wardrobe_items: {
        Args: { min_count?: number }
        Returns: undefined
      }
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
      get_merchant_profiles_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          address_status: string
          business_name: string
          business_type: string
          contact_status: string
          created_at: string
          id: string
          tax_id_status: string
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
      get_provider_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          auto_renew: boolean
          created_at: string
          expires_at: string
          id: string
          plan_name: string
          started_at: string
          status: string
          subscriber_id: string
          subscription_type: string
          updated_at: string
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
      get_recent_contact_security_incidents: {
        Args: { hours_back?: number }
        Returns: {
          action: string
          failure_reason: string
          incident_count: number
          incident_time: string
          user_id: string
        }[]
      }
      get_user_contact_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          social_facebook: string
          social_instagram: string
          social_tiktok: string
        }[]
      }
      get_user_contact_info_secure: {
        Args: { mask_data?: boolean }
        Returns: {
          email: string
          social_facebook: string
          social_instagram: string
          social_tiktok: string
        }[]
      }
      hash_backup_code: {
        Args: { code: string }
        Returns: string
      }
      insert_encrypted_merchant_profile: {
        Args: {
          business_address_param?: Json
          business_name_param: string
          business_type_param?: string
          contact_info_param?: Json
          tax_id_param?: string
        }
        Returns: string
      }
      list_invitations_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
          used_at: string
        }[]
      }
      log_merchant_sensitive_access: {
        Args: { accessed_fields: string[]; merchant_profile_id: string }
        Returns: boolean
      }
      log_sensitive_data_access: {
        Args: {
          operation: string
          sensitive_fields: string[]
          table_name: string
        }
        Returns: undefined
      }
      log_suspicious_contact_access: {
        Args: { access_type: string; attempted_user_id: string; reason: string }
        Returns: undefined
      }
      mask_contact_data: {
        Args: { data_text: string; mask_type?: string }
        Returns: string
      }
      revoke_invitation_admin: {
        Args: { invitation_token: string }
        Returns: boolean
      }
      secure_merchant_data_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          address_summary: string
          business_name: string
          business_type: string
          contact_summary: string
          tax_id_masked: string
          verification_status: string
        }[]
      }
      setup_user_mfa: {
        Args: {
          backup_codes_data?: string[]
          phone_data?: string
          secret_data?: string
          setup_type: string
        }
        Returns: Json
      }
      test_contact_info_security: {
        Args: { test_user_id?: string }
        Returns: {
          details: string
          result: boolean
          test_name: string
        }[]
      }
      update_contact_info_secure: {
        Args: {
          new_email?: string
          new_facebook?: string
          new_instagram?: string
          new_tiktok?: string
        }
        Returns: boolean
      }
      update_encrypted_merchant_profile: {
        Args: {
          business_address_param?: Json
          business_name_param?: string
          business_type_param?: string
          contact_info_param?: Json
          profile_id_param: string
          tax_id_param?: string
        }
        Returns: boolean
      }
      update_mfa_status: {
        Args: { enable_totp?: boolean; verify_phone?: boolean }
        Returns: boolean
      }
      use_backup_code: {
        Args: { input_code: string }
        Returns: boolean
      }
      validate_merchant_security: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_user_session: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_user_session_robust: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_backup_code_hash: {
        Args: { code: string; hash: string }
        Returns: boolean
      }
      verify_totp_secret: {
        Args: { input_code: string }
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
