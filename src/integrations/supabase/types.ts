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
      ai_rate_limits_config: {
        Row: {
          created_at: string | null
          daily_analyses: number | null
          daily_chat_messages: number | null
          daily_image_generations: number | null
          daily_recommendations: number | null
          id: string
          max_session_duration_minutes: number | null
          max_tokens_per_day: number | null
          user_tier: string
        }
        Insert: {
          created_at?: string | null
          daily_analyses?: number | null
          daily_chat_messages?: number | null
          daily_image_generations?: number | null
          daily_recommendations?: number | null
          id?: string
          max_session_duration_minutes?: number | null
          max_tokens_per_day?: number | null
          user_tier: string
        }
        Update: {
          created_at?: string | null
          daily_analyses?: number | null
          daily_chat_messages?: number | null
          daily_image_generations?: number | null
          daily_recommendations?: number | null
          id?: string
          max_session_duration_minutes?: number | null
          max_tokens_per_day?: number | null
          user_tier?: string
        }
        Relationships: []
      }
      ai_service_settings: {
        Row: {
          brand_preferences: string[] | null
          chat_model: string | null
          color_preferences: string[] | null
          created_at: string
          daily_request_limit: number | null
          enable_outfit_suggestions: boolean | null
          enable_style_chat: boolean | null
          enable_usage_alerts: boolean | null
          enable_virtual_tryon: boolean | null
          enable_wardrobe_insights: boolean | null
          id: string
          image_model: string | null
          recommendation_model: string | null
          style_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_preferences?: string[] | null
          chat_model?: string | null
          color_preferences?: string[] | null
          created_at?: string
          daily_request_limit?: number | null
          enable_outfit_suggestions?: boolean | null
          enable_style_chat?: boolean | null
          enable_usage_alerts?: boolean | null
          enable_virtual_tryon?: boolean | null
          enable_wardrobe_insights?: boolean | null
          id?: string
          image_model?: string | null
          recommendation_model?: string | null
          style_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_preferences?: string[] | null
          chat_model?: string | null
          color_preferences?: string[] | null
          created_at?: string
          daily_request_limit?: number | null
          enable_outfit_suggestions?: boolean | null
          enable_style_chat?: boolean | null
          enable_usage_alerts?: boolean | null
          enable_virtual_tryon?: boolean | null
          enable_wardrobe_insights?: boolean | null
          id?: string
          image_model?: string | null
          recommendation_model?: string | null
          style_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_style_recommendations: {
        Row: {
          confidence_score: number | null
          context: Json | null
          created_at: string | null
          id: string
          reasoning: string | null
          recommendation_data: Json
          recommendation_type: string
          user_feedback: string | null
          user_id: string
          was_accepted: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          context?: Json | null
          created_at?: string | null
          id?: string
          reasoning?: string | null
          recommendation_data: Json
          recommendation_type: string
          user_feedback?: string | null
          user_id: string
          was_accepted?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          context?: Json | null
          created_at?: string | null
          id?: string
          reasoning?: string | null
          recommendation_data?: Json
          recommendation_type?: string
          user_feedback?: string | null
          user_id?: string
          was_accepted?: boolean | null
        }
        Relationships: []
      }
      ai_style_sessions: {
        Row: {
          context_data: Json | null
          conversation_history: Json | null
          created_at: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          session_type: string
          started_at: string | null
          total_messages: number | null
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          conversation_history?: Json | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          session_type: string
          started_at?: string | null
          total_messages?: number | null
          user_id: string
        }
        Update: {
          context_data?: Json | null
          conversation_history?: Json | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          session_type?: string
          started_at?: string | null
          total_messages?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_tracking: {
        Row: {
          cost_credits: number | null
          created_at: string | null
          id: string
          request_count: number | null
          service_type: string
          tokens_used: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          cost_credits?: number | null
          created_at?: string | null
          id?: string
          request_count?: number | null
          service_type: string
          tokens_used?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          cost_credits?: number | null
          created_at?: string | null
          id?: string
          request_count?: number | null
          service_type?: string
          tokens_used?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_at: string
          blocked_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_at?: string
          blocked_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_at?: string
          blocked_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_participations: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "style_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          comments_count: number | null
          description: string
          id: string
          image_urls: string[]
          is_winner: boolean | null
          likes_count: number | null
          outfit_items: string[] | null
          submitted_at: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          comments_count?: number | null
          description: string
          id?: string
          image_urls: string[]
          is_winner?: boolean | null
          likes_count?: number | null
          outfit_items?: string[] | null
          submitted_at?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          comments_count?: number | null
          description?: string
          id?: string
          image_urls?: string[]
          is_winner?: boolean | null
          likes_count?: number | null
          outfit_items?: string[] | null
          submitted_at?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "style_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_access_log: {
        Row: {
          action: string
          collection_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          collection_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          collection_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_access_log_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_collections"
            referencedColumns: ["id"]
          },
        ]
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
      collection_rate_limits: {
        Row: {
          action: string
          attempt_count: number
          created_at: string
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          action: string
          attempt_count?: number
          created_at?: string
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          action?: string
          attempt_count?: number
          created_at?: string
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
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
      compliance_audit_log: {
        Row: {
          action_taken: string
          compliance_type: string
          consent_given: boolean | null
          created_at: string
          data_categories: string[] | null
          data_subject_id: string | null
          event_details: Json | null
          event_type: string
          id: string
          legal_basis: string | null
          processing_purpose: string | null
          retention_period: string | null
          user_id: string | null
        }
        Insert: {
          action_taken: string
          compliance_type: string
          consent_given?: boolean | null
          created_at?: string
          data_categories?: string[] | null
          data_subject_id?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          legal_basis?: string | null
          processing_purpose?: string | null
          retention_period?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string
          compliance_type?: string
          consent_given?: boolean | null
          created_at?: string
          data_categories?: string[] | null
          data_subject_id?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          legal_basis?: string | null
          processing_purpose?: string | null
          retention_period?: string | null
          user_id?: string | null
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
      currency_settings: {
        Row: {
          auto_convert: boolean
          base_currency: string
          created_at: string
          display_currency: string
          id: string
          preferred_payment_method: string | null
          tax_rate: number
          tax_region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_convert?: boolean
          base_currency?: string
          created_at?: string
          display_currency?: string
          id?: string
          preferred_payment_method?: string | null
          tax_rate?: number
          tax_region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_convert?: boolean
          base_currency?: string
          created_at?: string
          display_currency?: string
          id?: string
          preferred_payment_method?: string | null
          tax_rate?: number
          tax_region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_outfit_suggestions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          is_accepted: boolean | null
          is_rejected: boolean | null
          occasion: string | null
          outfit_id: string | null
          suggestion_date: string
          time_slot: string
          updated_at: string
          user_id: string
          weather_data: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_rejected?: boolean | null
          occasion?: string | null
          outfit_id?: string | null
          suggestion_date?: string
          time_slot?: string
          updated_at?: string
          user_id: string
          weather_data?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_rejected?: boolean | null
          occasion?: string | null
          outfit_id?: string | null
          suggestion_date?: string
          time_slot?: string
          updated_at?: string
          user_id?: string
          weather_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_outfit_suggestions_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_patterns: {
        Row: {
          access_count: number | null
          access_type: string
          anomaly_reasons: string[] | null
          created_at: string
          id: string
          is_anomalous: boolean | null
          resource_id: string | null
          resource_type: string
          time_window_start: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          access_type: string
          anomaly_reasons?: string[] | null
          created_at?: string
          id?: string
          is_anomalous?: boolean | null
          resource_id?: string | null
          resource_type: string
          time_window_start?: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          access_type?: string
          anomaly_reasons?: string[] | null
          created_at?: string
          id?: string
          is_anomalous?: boolean | null
          resource_id?: string | null
          resource_type?: string
          time_window_start?: string
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
      event_registrations: {
        Row: {
          event_id: string
          id: string
          payment_status: string | null
          registered_at: string | null
          registration_status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          payment_status?: string | null
          registered_at?: string | null
          registration_status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          payment_status?: string | null
          registered_at?: string | null
          registration_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "fashion_events"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      fashion_events: {
        Row: {
          attendees_count: number | null
          category: string
          created_at: string | null
          description: string
          event_date: string
          event_time: string
          event_type: string
          host_id: string | null
          host_name: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string
          max_attendees: number | null
          price: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees_count?: number | null
          category: string
          created_at?: string | null
          description: string
          event_date: string
          event_time: string
          event_type: string
          host_id?: string | null
          host_name: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location: string
          max_attendees?: number | null
          price?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees_count?: number | null
          category?: string
          created_at?: string | null
          description?: string
          event_date?: string
          event_time?: string
          event_type?: string
          host_id?: string | null
          host_name?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string
          max_attendees?: number | null
          price?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_audit_log: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          event_details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      influencer_applications: {
        Row: {
          application_status: string | null
          applied_at: string | null
          approved_at: string | null
          commission_rate: number | null
          engagement_rate: number | null
          follower_count: number | null
          id: string
          reviewed_by: string | null
          social_profiles: Json
          tier: string | null
          total_conversions: number | null
          total_earnings: number | null
          user_id: string
        }
        Insert: {
          application_status?: string | null
          applied_at?: string | null
          approved_at?: string | null
          commission_rate?: number | null
          engagement_rate?: number | null
          follower_count?: number | null
          id?: string
          reviewed_by?: string | null
          social_profiles: Json
          tier?: string | null
          total_conversions?: number | null
          total_earnings?: number | null
          user_id: string
        }
        Update: {
          application_status?: string | null
          applied_at?: string | null
          approved_at?: string | null
          commission_rate?: number | null
          engagement_rate?: number | null
          follower_count?: number | null
          id?: string
          reviewed_by?: string | null
          social_profiles?: Json
          tier?: string | null
          total_conversions?: number | null
          total_earnings?: number | null
          user_id?: string
        }
        Relationships: []
      }
      influencer_referrals: {
        Row: {
          commission_earned: number | null
          conversion_status: string | null
          converted_at: string | null
          created_at: string | null
          id: string
          influencer_id: string
          order_id: string | null
          referral_code: string
          referred_user_id: string | null
        }
        Insert: {
          commission_earned?: number | null
          conversion_status?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          influencer_id: string
          order_id?: string | null
          referral_code: string
          referred_user_id?: string | null
        }
        Update: {
          commission_earned?: number | null
          conversion_status?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string
          order_id?: string | null
          referral_code?: string
          referred_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_referrals_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_applications"
            referencedColumns: ["user_id"]
          },
        ]
      }
      inventory_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          current_value: number | null
          id: string
          is_resolved: boolean | null
          item_id: string
          merchant_id: string
          message: string
          resolved_at: string | null
          threshold_value: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_resolved?: boolean | null
          item_id: string
          merchant_id: string
          message: string
          resolved_at?: string | null
          threshold_value?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_resolved?: boolean | null
          item_id?: string
          merchant_id?: string
          message?: string
          resolved_at?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "merchant_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      inventory_sync_log: {
        Row: {
          completed_at: string | null
          data_integrity_hash: string | null
          id: string
          items_synced: number | null
          merchant_id: string
          started_at: string | null
          store_location_id: string | null
          sync_duration_ms: number | null
          sync_errors: Json | null
          sync_status: string | null
          sync_type: string
          terminal_id: string | null
        }
        Insert: {
          completed_at?: string | null
          data_integrity_hash?: string | null
          id?: string
          items_synced?: number | null
          merchant_id: string
          started_at?: string | null
          store_location_id?: string | null
          sync_duration_ms?: number | null
          sync_errors?: Json | null
          sync_status?: string | null
          sync_type: string
          terminal_id?: string | null
        }
        Update: {
          completed_at?: string | null
          data_integrity_hash?: string | null
          id?: string
          items_synced?: number | null
          merchant_id?: string
          started_at?: string | null
          store_location_id?: string | null
          sync_duration_ms?: number | null
          sync_errors?: Json | null
          sync_status?: string | null
          sync_type?: string
          terminal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_sync_log_store_location_id_fkey"
            columns: ["store_location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_sync_log_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "pos_terminals"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          from_location_id: string | null
          id: string
          merchant_id: string
          merchant_item_id: string
          notes: string | null
          quantity: number
          requested_at: string | null
          requested_by: string | null
          to_location_id: string | null
          tracking_info: Json | null
          transfer_status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          from_location_id?: string | null
          id?: string
          merchant_id: string
          merchant_item_id: string
          notes?: string | null
          quantity: number
          requested_at?: string | null
          requested_by?: string | null
          to_location_id?: string | null
          tracking_info?: Json | null
          transfer_status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          from_location_id?: string | null
          id?: string
          merchant_id?: string
          merchant_item_id?: string
          notes?: string | null
          quantity?: number
          requested_at?: string | null
          requested_by?: string | null
          to_location_id?: string | null
          tracking_info?: Json | null
          transfer_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_merchant_item_id_fkey"
            columns: ["merchant_item_id"]
            isOneToOne: false
            referencedRelation: "merchant_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_reputation: {
        Row: {
          asn: string | null
          block_reason: string | null
          country_code: string | null
          created_at: string
          failed_attempts: number | null
          first_seen_at: string
          id: string
          ip_address: unknown
          is_blocked: boolean | null
          is_proxy: boolean | null
          is_tor: boolean | null
          is_vpn: boolean | null
          last_seen_at: string | null
          reputation_score: number | null
          successful_logins: number | null
          threat_categories: string[] | null
          threat_level: string | null
          updated_at: string
        }
        Insert: {
          asn?: string | null
          block_reason?: string | null
          country_code?: string | null
          created_at?: string
          failed_attempts?: number | null
          first_seen_at?: string
          id?: string
          ip_address: unknown
          is_blocked?: boolean | null
          is_proxy?: boolean | null
          is_tor?: boolean | null
          is_vpn?: boolean | null
          last_seen_at?: string | null
          reputation_score?: number | null
          successful_logins?: number | null
          threat_categories?: string[] | null
          threat_level?: string | null
          updated_at?: string
        }
        Update: {
          asn?: string | null
          block_reason?: string | null
          country_code?: string | null
          created_at?: string
          failed_attempts?: number | null
          first_seen_at?: string
          id?: string
          ip_address?: unknown
          is_blocked?: boolean | null
          is_proxy?: boolean | null
          is_tor?: boolean | null
          is_vpn?: boolean | null
          last_seen_at?: string | null
          reputation_score?: number | null
          successful_logins?: number | null
          threat_categories?: string[] | null
          threat_level?: string | null
          updated_at?: string
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
      item_verifications: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          verification_notes: string | null
          verification_photos: Json | null
          verification_status: string
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          verification_notes?: string | null
          verification_photos?: Json | null
          verification_status?: string
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          verification_notes?: string | null
          verification_photos?: Json | null
          verification_status?: string
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_verifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "market_items"
            referencedColumns: ["id"]
          },
        ]
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
      location_inventory: {
        Row: {
          created_at: string | null
          id: string
          last_count_date: string | null
          last_restock_date: string | null
          location_id: string
          merchant_item_id: string
          notes: string | null
          quantity: number
          reorder_point: number | null
          reserved_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_count_date?: string | null
          last_restock_date?: string | null
          location_id: string
          merchant_item_id: string
          notes?: string | null
          quantity?: number
          reorder_point?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_count_date?: string | null
          last_restock_date?: string | null
          location_id?: string
          merchant_item_id?: string
          notes?: string | null
          quantity?: number
          reorder_point?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_inventory_merchant_item_id_fkey"
            columns: ["merchant_item_id"]
            isOneToOne: false
            referencedRelation: "merchant_items"
            referencedColumns: ["id"]
          },
        ]
      }
      market_fraud_detection: {
        Row: {
          action_taken: string | null
          created_at: string
          details: Json | null
          fraud_type: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          details?: Json | null
          fraud_type: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score: number
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          details?: Json | null
          fraud_type?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_fraud_detection_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "market_transaction_log"
            referencedColumns: ["id"]
          },
        ]
      }
      market_item_reports: {
        Row: {
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          item_id: string
          merchant_id: string
          report_category: string
          reporter_id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          item_id: string
          merchant_id: string
          report_category: string
          reporter_id: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          item_id?: string
          merchant_id?: string
          report_category?: string
          reporter_id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      market_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          condition: string
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          location: string | null
          material: string | null
          original_price: number | null
          photos: Json | null
          price: number
          seller_id: string
          shipping_options: Json | null
          size: string | null
          status: string
          sustainability_score: number | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
          wardrobe_item_id: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          location?: string | null
          material?: string | null
          original_price?: number | null
          photos?: Json | null
          price: number
          seller_id: string
          shipping_options?: Json | null
          size?: string | null
          status?: string
          sustainability_score?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
          wardrobe_item_id?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          location?: string | null
          material?: string | null
          original_price?: number | null
          photos?: Json | null
          price?: number
          seller_id?: string
          shipping_options?: Json | null
          size?: string | null
          status?: string
          sustainability_score?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      market_merchant_verification: {
        Row: {
          average_rating: number | null
          business_name: string | null
          business_registration: string | null
          created_at: string
          dispute_count: number | null
          documents_verified: boolean | null
          email_verified: boolean | null
          id: string
          identity_verified: boolean | null
          is_suspended: boolean | null
          phone_verified: boolean | null
          report_count: number | null
          successful_transactions: number | null
          suspension_reason: string | null
          tax_id: string | null
          total_sales: number | null
          trust_score: number | null
          updated_at: string
          user_id: string
          verification_tier: string
          verified_at: string | null
        }
        Insert: {
          average_rating?: number | null
          business_name?: string | null
          business_registration?: string | null
          created_at?: string
          dispute_count?: number | null
          documents_verified?: boolean | null
          email_verified?: boolean | null
          id?: string
          identity_verified?: boolean | null
          is_suspended?: boolean | null
          phone_verified?: boolean | null
          report_count?: number | null
          successful_transactions?: number | null
          suspension_reason?: string | null
          tax_id?: string | null
          total_sales?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          verification_tier: string
          verified_at?: string | null
        }
        Update: {
          average_rating?: number | null
          business_name?: string | null
          business_registration?: string | null
          created_at?: string
          dispute_count?: number | null
          documents_verified?: boolean | null
          email_verified?: boolean | null
          id?: string
          identity_verified?: boolean | null
          is_suspended?: boolean | null
          phone_verified?: boolean | null
          report_count?: number | null
          successful_transactions?: number | null
          suspension_reason?: string | null
          tax_id?: string | null
          total_sales?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          verification_tier?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      market_rate_limits: {
        Row: {
          created_at: string
          daily_amount: number | null
          daily_purchases: number | null
          daily_reset_at: string
          hourly_amount: number | null
          hourly_purchases: number | null
          hourly_reset_at: string
          id: string
          last_purchase_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_amount?: number | null
          daily_purchases?: number | null
          daily_reset_at?: string
          hourly_amount?: number | null
          hourly_purchases?: number | null
          hourly_reset_at?: string
          id?: string
          last_purchase_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_amount?: number | null
          daily_purchases?: number | null
          daily_reset_at?: string
          hourly_amount?: number | null
          hourly_purchases?: number | null
          hourly_reset_at?: string
          id?: string
          last_purchase_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_transaction_log: {
        Row: {
          amount: number
          buyer_id: string
          completed_at: string | null
          created_at: string
          currency: string | null
          fraud_score: number | null
          id: string
          ip_address: unknown | null
          is_suspicious: boolean | null
          item_id: string | null
          merchant_id: string
          payment_gateway_id: string | null
          payment_method: string | null
          status: string
          transaction_type: string
          user_agent: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          item_id?: string | null
          merchant_id: string
          payment_gateway_id?: string | null
          payment_method?: string | null
          status: string
          transaction_type: string
          user_agent?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          item_id?: string | null
          merchant_id?: string
          payment_gateway_id?: string | null
          payment_method?: string | null
          status?: string
          transaction_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      marketplace_disputes: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          dispute_type: string
          evidence: Json | null
          filed_against: string
          filed_by: string
          id: string
          resolution: string | null
          resolved_at: string | null
          status: string
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          dispute_type: string
          evidence?: Json | null
          filed_against: string
          filed_by: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          dispute_type?: string
          evidence?: Json | null
          filed_against?: string
          filed_by?: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "marketplace_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_read: boolean | null
          item_id: string | null
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          transaction_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          item_id?: string | null
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          transaction_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          item_id?: string | null
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_messages_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "market_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_messages_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "marketplace_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          review_text: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
          seller_response: string | null
          seller_response_date: string | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          review_text?: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
          seller_response?: string | null
          seller_response_date?: string | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          review_text?: string | null
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
          seller_response?: string | null
          seller_response_date?: string | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "marketplace_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          buyer_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          item_id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          price: number
          seller_id: string
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          item_id: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price: number
          seller_id: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price?: number
          seller_id?: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "market_items"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_analytics: {
        Row: {
          average_order_value: number | null
          created_at: string | null
          date: string
          id: string
          merchant_id: string
          new_customers: number | null
          returning_customers: number | null
          revenue_by_category: Json | null
          top_selling_items: Json | null
          total_items_sold: number | null
          total_orders: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          average_order_value?: number | null
          created_at?: string | null
          date?: string
          id?: string
          merchant_id: string
          new_customers?: number | null
          returning_customers?: number | null
          revenue_by_category?: Json | null
          top_selling_items?: Json | null
          total_items_sold?: number | null
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          average_order_value?: number | null
          created_at?: string | null
          date?: string
          id?: string
          merchant_id?: string
          new_customers?: number | null
          returning_customers?: number | null
          revenue_by_category?: Json | null
          top_selling_items?: Json | null
          total_items_sold?: number | null
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_analytics_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      merchant_customer_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          customer_id: string
          id: string
          ip_address: unknown | null
          merchant_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          customer_id: string
          id?: string
          ip_address?: unknown | null
          merchant_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          customer_id?: string
          id?: string
          ip_address?: unknown | null
          merchant_id?: string
        }
        Relationships: []
      }
      merchant_customers: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          last_order_date: string | null
          merchant_id: string
          notes: string | null
          preferred_categories: string[] | null
          tags: string[] | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          last_order_date?: string | null
          merchant_id: string
          notes?: string | null
          preferred_categories?: string[] | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          last_order_date?: string | null
          merchant_id?: string
          notes?: string | null
          preferred_categories?: string[] | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_customers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      merchant_employees: {
        Row: {
          created_at: string | null
          employee_email: string
          employee_name: string
          employee_phone: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          location_id: string | null
          merchant_id: string
          permissions: Json | null
          position: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_email: string
          employee_name: string
          employee_phone?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          merchant_id: string
          permissions?: Json | null
          position: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_email?: string
          employee_name?: string
          employee_phone?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          merchant_id?: string
          permissions?: Json | null
          position?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_employees_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_events: {
        Row: {
          banner_image: string | null
          created_at: string | null
          current_attendees: number | null
          description: string | null
          end_date: string
          event_type: string
          id: string
          is_active: boolean | null
          is_online: boolean | null
          location: string | null
          max_attendees: number | null
          merchant_id: string
          name: string
          registration_link: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          merchant_id: string
          name: string
          registration_link?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          merchant_id?: string
          name?: string
          registration_link?: string | null
          start_date?: string
          updated_at?: string | null
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
          status: string | null
          stock_quantity: number | null
          style_tags: string[] | null
          tags: string[] | null
          updated_at: string
          videos: Json | null
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
          status?: string | null
          stock_quantity?: number | null
          style_tags?: string[] | null
          tags?: string[] | null
          updated_at?: string
          videos?: Json | null
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
          status?: string | null
          stock_quantity?: number | null
          style_tags?: string[] | null
          tags?: string[] | null
          updated_at?: string
          videos?: Json | null
        }
        Relationships: []
      }
      merchant_pages: {
        Row: {
          accent_color: string | null
          active_sections: Json | null
          background_color: string | null
          brand_story: string | null
          business_hours: Json | null
          business_name: string
          contact_info: Json | null
          cover_video: string | null
          created_at: string
          custom_css: string | null
          enable_chat: boolean | null
          enable_quick_view: boolean | null
          enable_wishlist: boolean | null
          featured_collections: string[] | null
          font_family: string | null
          gallery_images: string[] | null
          google_analytics: string | null
          hero_image: string | null
          id: string
          is_published: boolean | null
          keywords: string | null
          layout_style: string | null
          logo: string | null
          merchant_id: string
          meta_description: string | null
          profile_photo: string | null
          secondary_color: string | null
          section_order: Json | null
          show_reviews: boolean | null
          show_social_proof: boolean | null
          show_stock_count: boolean | null
          social_links: Json | null
          specialties: string[] | null
          text_color: string | null
          theme_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          active_sections?: Json | null
          background_color?: string | null
          brand_story?: string | null
          business_hours?: Json | null
          business_name: string
          contact_info?: Json | null
          cover_video?: string | null
          created_at?: string
          custom_css?: string | null
          enable_chat?: boolean | null
          enable_quick_view?: boolean | null
          enable_wishlist?: boolean | null
          featured_collections?: string[] | null
          font_family?: string | null
          gallery_images?: string[] | null
          google_analytics?: string | null
          hero_image?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string | null
          layout_style?: string | null
          logo?: string | null
          merchant_id: string
          meta_description?: string | null
          profile_photo?: string | null
          secondary_color?: string | null
          section_order?: Json | null
          show_reviews?: boolean | null
          show_social_proof?: boolean | null
          show_stock_count?: boolean | null
          social_links?: Json | null
          specialties?: string[] | null
          text_color?: string | null
          theme_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          active_sections?: Json | null
          background_color?: string | null
          brand_story?: string | null
          business_hours?: Json | null
          business_name?: string
          contact_info?: Json | null
          cover_video?: string | null
          created_at?: string
          custom_css?: string | null
          enable_chat?: boolean | null
          enable_quick_view?: boolean | null
          enable_wishlist?: boolean | null
          featured_collections?: string[] | null
          font_family?: string | null
          gallery_images?: string[] | null
          google_analytics?: string | null
          hero_image?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string | null
          layout_style?: string | null
          logo?: string | null
          merchant_id?: string
          meta_description?: string | null
          profile_photo?: string | null
          secondary_color?: string | null
          section_order?: Json | null
          show_reviews?: boolean | null
          show_social_proof?: boolean | null
          show_stock_count?: boolean | null
          social_links?: Json | null
          specialties?: string[] | null
          text_color?: string | null
          theme_color?: string | null
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
      merchant_settings: {
        Row: {
          accepted_payment_methods: string[] | null
          auto_accept_orders: boolean | null
          auto_reorder: boolean | null
          brand_colors: Json | null
          commission_rate: number | null
          created_at: string
          custom_css: string | null
          enable_analytics: boolean | null
          enable_customer_reviews: boolean | null
          enable_email_marketing: boolean | null
          enable_installments: boolean | null
          enable_loyalty_program: boolean | null
          enable_order_tracking: boolean | null
          enable_promotions: boolean | null
          enable_stock_alerts: boolean | null
          id: string
          low_stock_threshold: number | null
          merchant_id: string
          order_processing_time: number | null
          payment_gateway: string | null
          require_review_moderation: boolean | null
          store_theme: string | null
          updated_at: string
        }
        Insert: {
          accepted_payment_methods?: string[] | null
          auto_accept_orders?: boolean | null
          auto_reorder?: boolean | null
          brand_colors?: Json | null
          commission_rate?: number | null
          created_at?: string
          custom_css?: string | null
          enable_analytics?: boolean | null
          enable_customer_reviews?: boolean | null
          enable_email_marketing?: boolean | null
          enable_installments?: boolean | null
          enable_loyalty_program?: boolean | null
          enable_order_tracking?: boolean | null
          enable_promotions?: boolean | null
          enable_stock_alerts?: boolean | null
          id?: string
          low_stock_threshold?: number | null
          merchant_id: string
          order_processing_time?: number | null
          payment_gateway?: string | null
          require_review_moderation?: boolean | null
          store_theme?: string | null
          updated_at?: string
        }
        Update: {
          accepted_payment_methods?: string[] | null
          auto_accept_orders?: boolean | null
          auto_reorder?: boolean | null
          brand_colors?: Json | null
          commission_rate?: number | null
          created_at?: string
          custom_css?: string | null
          enable_analytics?: boolean | null
          enable_customer_reviews?: boolean | null
          enable_email_marketing?: boolean | null
          enable_installments?: boolean | null
          enable_loyalty_program?: boolean | null
          enable_order_tracking?: boolean | null
          enable_promotions?: boolean | null
          enable_stock_alerts?: boolean | null
          id?: string
          low_stock_threshold?: number | null
          merchant_id?: string
          order_processing_time?: number | null
          payment_gateway?: string | null
          require_review_moderation?: boolean | null
          store_theme?: string | null
          updated_at?: string
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
      muted_users: {
        Row: {
          id: string
          muted_at: string
          muted_until: string | null
          muted_user_id: string
          user_id: string
        }
        Insert: {
          id?: string
          muted_at?: string
          muted_until?: string | null
          muted_user_id: string
          user_id: string
        }
        Update: {
          id?: string
          muted_at?: string
          muted_until?: string | null
          muted_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          achievement_notifications: boolean
          created_at: string
          email_enabled: boolean
          id: string
          marketplace_updates: boolean
          outfit_suggestions: boolean
          push_enabled: boolean
          social_notifications: boolean
          updated_at: string
          user_id: string
          weather_alerts: boolean
        }
        Insert: {
          achievement_notifications?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          marketplace_updates?: boolean
          outfit_suggestions?: boolean
          push_enabled?: boolean
          social_notifications?: boolean
          updated_at?: string
          user_id: string
          weather_alerts?: boolean
        }
        Update: {
          achievement_notifications?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          marketplace_updates?: boolean
          outfit_suggestions?: boolean
          push_enabled?: boolean
          social_notifications?: boolean
          updated_at?: string
          user_id?: string
          weather_alerts?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      occasion_templates: {
        Row: {
          created_at: string | null
          example_outfits: Json | null
          formality_level: number | null
          id: string
          occasion_category: string
          occasion_name: string
          season_suitability: string[] | null
          template_rules: Json
          time_of_day: string[] | null
          updated_at: string | null
          weather_conditions: Json | null
        }
        Insert: {
          created_at?: string | null
          example_outfits?: Json | null
          formality_level?: number | null
          id?: string
          occasion_category: string
          occasion_name: string
          season_suitability?: string[] | null
          template_rules: Json
          time_of_day?: string[] | null
          updated_at?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          created_at?: string | null
          example_outfits?: Json | null
          formality_level?: number | null
          id?: string
          occasion_category?: string
          occasion_name?: string
          season_suitability?: string[] | null
          template_rules?: Json
          time_of_day?: string[] | null
          updated_at?: string | null
          weather_conditions?: Json | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          merchant_item_id: string | null
          name: string
          order_id: string
          price: number
          quantity: number
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          merchant_item_id?: string | null
          name: string
          order_id: string
          price: number
          quantity?: number
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          merchant_item_id?: string | null
          name?: string
          order_id?: string
          price?: number
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_merchant_item_id_fkey"
            columns: ["merchant_item_id"]
            isOneToOne: false
            referencedRelation: "merchant_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          order_id: string
          previous_status: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          order_id: string
          previous_status?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          order_id?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          encryption_salt: string | null
          id: string
          items: Json
          merchant_id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          shipping_address: Json | null
          shipping_amount: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          encryption_salt?: string | null
          id?: string
          items: Json
          merchant_id: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          shipping_address?: Json | null
          shipping_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          encryption_salt?: string | null
          id?: string
          items?: Json
          merchant_id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          shipping_address?: Json | null
          shipping_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      outfit_history: {
        Row: {
          created_at: string
          id: string
          location: string | null
          notes: string | null
          occasion: string | null
          outfit_items: string[]
          rating: number | null
          updated_at: string
          user_id: string
          weather: string | null
          worn_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          occasion?: string | null
          outfit_items: string[]
          rating?: number | null
          updated_at?: string
          user_id: string
          weather?: string | null
          worn_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          occasion?: string | null
          outfit_items?: string[]
          rating?: number | null
          updated_at?: string
          user_id?: string
          weather?: string | null
          worn_date?: string
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
      outfit_suggestions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          is_accepted: boolean | null
          occasion: string | null
          outfit_id: string | null
          reasoning: string | null
          suggestion_type: string
          user_id: string
          weather_data: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          occasion?: string | null
          outfit_id?: string | null
          reasoning?: string | null
          suggestion_type: string
          user_id: string
          weather_data?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          occasion?: string | null
          outfit_id?: string | null
          reasoning?: string | null
          suggestion_type?: string
          user_id?: string
          weather_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_suggestions_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
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
      payment_fraud_detection: {
        Row: {
          created_at: string
          decision: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_factors: Json | null
          risk_score: number
          transaction_id: string
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_factors?: Json | null
          risk_score: number
          transaction_id: string
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_factors?: Json | null
          risk_score?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_fraud_detection_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          merchant_id: string
          order_id: string
          payment_data: Json | null
          payment_gateway: string | null
          payment_method: string
          payment_status: string
          processed_at: string | null
          refund_amount: number | null
          refund_reason: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          merchant_id: string
          order_id: string
          payment_data?: Json | null
          payment_gateway?: string | null
          payment_method: string
          payment_status?: string
          processed_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          merchant_id?: string
          order_id?: string
          payment_data?: Json | null
          payment_gateway?: string | null
          payment_method?: string
          payment_status?: string
          processed_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          created_at: string
          default_method: string | null
          enable_3d_secure: boolean | null
          enable_auto_save: boolean | null
          enable_transaction_alerts: boolean | null
          id: string
          require_cvv: boolean | null
          saved_bank_accounts: Json | null
          saved_cards: Json | null
          saved_wallets: Json | null
          spending_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_method?: string | null
          enable_3d_secure?: boolean | null
          enable_auto_save?: boolean | null
          enable_transaction_alerts?: boolean | null
          id?: string
          require_cvv?: boolean | null
          saved_bank_accounts?: Json | null
          saved_cards?: Json | null
          saved_wallets?: Json | null
          spending_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_method?: string | null
          enable_3d_secure?: boolean | null
          enable_auto_save?: boolean | null
          enable_transaction_alerts?: boolean | null
          id?: string
          require_cvv?: boolean | null
          saved_bank_accounts?: Json | null
          saved_cards?: Json | null
          saved_wallets?: Json | null
          spending_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string | null
          fraud_score: number | null
          id: string
          metadata: Json | null
          payment_method: string | null
          related_transaction_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          fraud_score?: number | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          related_transaction_id?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          fraud_score?: number | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          related_transaction_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_activity_log: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          is_suspicious: boolean | null
          merchant_id: string
          staff_id: string | null
          terminal_id: string | null
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          merchant_id: string
          staff_id?: string | null
          terminal_id?: string | null
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          merchant_id?: string
          staff_id?: string | null
          terminal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_activity_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "store_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_activity_log_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "pos_terminals"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_terminals: {
        Row: {
          auth_token_hash: string
          created_at: string | null
          device_id: string
          hardware_info: Json | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          merchant_id: string
          security_level: string | null
          software_version: string | null
          store_location_id: string | null
          terminal_code: string
          terminal_name: string
          updated_at: string | null
        }
        Insert: {
          auth_token_hash: string
          created_at?: string | null
          device_id: string
          hardware_info?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          merchant_id: string
          security_level?: string | null
          software_version?: string | null
          store_location_id?: string | null
          terminal_code: string
          terminal_name: string
          updated_at?: string | null
        }
        Update: {
          auth_token_hash?: string
          created_at?: string | null
          device_id?: string
          hardware_info?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          merchant_id?: string
          security_level?: string | null
          software_version?: string | null
          store_location_id?: string | null
          terminal_code?: string
          terminal_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_terminals_store_location_id_fkey"
            columns: ["store_location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          encrypted_customer_data: string | null
          encryption_salt: string | null
          fraud_score: number | null
          id: string
          ip_address: unknown | null
          is_suspicious: boolean | null
          items: Json
          merchant_id: string
          payment_method: string
          payment_reference: string | null
          receipt_number: string
          staff_id: string | null
          terminal_id: string | null
          transaction_status: string | null
          transaction_type: string
          user_agent: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          encrypted_customer_data?: string | null
          encryption_salt?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          items?: Json
          merchant_id: string
          payment_method: string
          payment_reference?: string | null
          receipt_number: string
          staff_id?: string | null
          terminal_id?: string | null
          transaction_status?: string | null
          transaction_type: string
          user_agent?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          encrypted_customer_data?: string | null
          encryption_salt?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          items?: Json
          merchant_id?: string
          payment_method?: string
          payment_reference?: string | null
          receipt_number?: string
          staff_id?: string | null
          terminal_id?: string | null
          transaction_status?: string | null
          transaction_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_transactions_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "pos_terminals"
            referencedColumns: ["id"]
          },
        ]
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
          email: string | null
          full_name: string | null
          id: string
          is_profile_public: boolean | null
          location: string | null
          privacy_settings: Json | null
          role: Database["public"]["Enums"]["user_role"]
          style_score: number | null
          updated_at: string
          user_id: string
          vto_photo_url: string | null
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
          style_score?: number | null
          updated_at?: string
          user_id: string
          vto_photo_url?: string | null
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
          style_score?: number | null
          updated_at?: string
          user_id?: string
          vto_photo_url?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applicable_categories: string[] | null
          applicable_items: string[] | null
          code: string | null
          created_at: string | null
          description: string | null
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          merchant_id: string
          min_purchase_amount: number | null
          name: string
          start_date: string
          type: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_items?: string[] | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          merchant_id: string
          min_purchase_amount?: number | null
          name: string
          start_date: string
          type: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_items?: string[] | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          merchant_id?: string
          min_purchase_amount?: number | null
          name?: string
          start_date?: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      reports: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          report_type: string
          reported_id: string
          reported_user_id: string | null
          reporter_id: string
          resolution_notes: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          report_type: string
          reported_id: string
          reported_user_id?: string | null
          reporter_id: string
          resolution_notes?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          report_type?: string
          reported_id?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      seconddresser_disputes: {
        Row: {
          created_at: string
          description: string
          dispute_reason: string
          evidence_urls: string[] | null
          filed_by: string
          id: string
          resolution: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          description: string
          dispute_reason: string
          evidence_urls?: string[] | null
          filed_by: string
          id?: string
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          description?: string
          dispute_reason?: string
          evidence_urls?: string[] | null
          filed_by?: string
          id?: string
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seconddresser_disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "seconddresser_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      seconddresser_flagged_users: {
        Row: {
          action_taken: string | null
          created_at: string
          evidence: string | null
          flagged_by: string
          flagged_user_id: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          evidence?: string | null
          flagged_by: string
          flagged_user_id: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          evidence?: string | null
          flagged_by?: string
          flagged_user_id?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      seconddresser_listings: {
        Row: {
          brand: string | null
          category: string | null
          condition: string
          created_at: string
          description: string
          favorites: number | null
          id: string
          is_negotiable: boolean | null
          location: string | null
          original_price: number | null
          photos: string[] | null
          price: number
          seller_id: string
          shipping_included: boolean | null
          size: string | null
          sold_at: string | null
          status: string
          title: string
          updated_at: string
          views: number | null
          wardrobe_item_id: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          condition: string
          created_at?: string
          description: string
          favorites?: number | null
          id?: string
          is_negotiable?: boolean | null
          location?: string | null
          original_price?: number | null
          photos?: string[] | null
          price: number
          seller_id: string
          shipping_included?: boolean | null
          size?: string | null
          sold_at?: string | null
          status?: string
          title: string
          updated_at?: string
          views?: number | null
          wardrobe_item_id?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          condition?: string
          created_at?: string
          description?: string
          favorites?: number | null
          id?: string
          is_negotiable?: boolean | null
          location?: string | null
          original_price?: number | null
          photos?: string[] | null
          price?: number
          seller_id?: string
          shipping_included?: boolean | null
          size?: string | null
          sold_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          views?: number | null
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seconddresser_listings_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      seconddresser_reviews: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          rating: number
          review_text: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating: number
          review_text?: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating?: number
          review_text?: string | null
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seconddresser_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "seconddresser_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      seconddresser_transactions: {
        Row: {
          amount: number
          buyer_id: string
          completed_at: string | null
          created_at: string
          delivered_at: string | null
          escrow_release_date: string | null
          escrow_status: string
          id: string
          listing_id: string
          notes: string | null
          payment_method: string | null
          seller_id: string
          shipped_at: string | null
          tracking_number: string | null
          transaction_status: string
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          escrow_release_date?: string | null
          escrow_status?: string
          id?: string
          listing_id: string
          notes?: string | null
          payment_method?: string | null
          seller_id: string
          shipped_at?: string | null
          tracking_number?: string | null
          transaction_status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          escrow_release_date?: string | null
          escrow_status?: string
          id?: string
          listing_id?: string
          notes?: string | null
          payment_method?: string | null
          seller_id?: string
          shipped_at?: string | null
          tracking_number?: string | null
          transaction_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seconddresser_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "seconddresser_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      seconddresser_user_credibility: {
        Row: {
          average_buyer_rating: number | null
          average_seller_rating: number | null
          created_at: string
          credibility_score: number | null
          disputes_filed: number | null
          disputes_lost: number | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          last_transaction_at: string | null
          reported_listings_count: number | null
          successful_purchases: number | null
          successful_sales: number | null
          total_purchases: number | null
          total_reviews_received: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_buyer_rating?: number | null
          average_seller_rating?: number | null
          created_at?: string
          credibility_score?: number | null
          disputes_filed?: number | null
          disputes_lost?: number | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_transaction_at?: string | null
          reported_listings_count?: number | null
          successful_purchases?: number | null
          successful_sales?: number | null
          total_purchases?: number | null
          total_reviews_received?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_buyer_rating?: number | null
          average_seller_rating?: number | null
          created_at?: string
          credibility_score?: number | null
          disputes_filed?: number | null
          disputes_lost?: number | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_transaction_at?: string | null
          reported_listings_count?: number | null
          successful_purchases?: number | null
          successful_sales?: number | null
          total_purchases?: number | null
          total_reviews_received?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_users: string[] | null
          alert_data: Json | null
          alert_type: string
          created_at: string
          id: string
          is_acknowledged: boolean | null
          message: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_users?: string[] | null
          alert_data?: Json | null
          alert_type: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_users?: string[] | null
          alert_data?: Json | null
          alert_type?: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
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
      security_incidents: {
        Row: {
          affected_resources: string[] | null
          assigned_to: string | null
          created_at: string
          detected_at: string
          id: string
          incident_details: Json
          incident_type: string
          ip_address: unknown | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          threat_indicators: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          affected_resources?: string[] | null
          assigned_to?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          incident_details?: Json
          incident_type: string
          ip_address?: unknown | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          threat_indicators?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          affected_resources?: string[] | null
          assigned_to?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          incident_details?: Json
          incident_type?: string
          ip_address?: unknown | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          threat_indicators?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sensitive_data_access_audit: {
        Row: {
          accessed_at: string | null
          accessed_fields: string[] | null
          id: string
          ip_address: unknown | null
          row_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          accessed_fields?: string[] | null
          id?: string
          ip_address?: unknown | null
          row_id: string
          table_name: string
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          accessed_fields?: string[] | null
          id?: string
          ip_address?: unknown | null
          row_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      sensitive_operation_limits: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          id: string
          operation_type: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          operation_type: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          operation_type?: string
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      session_security_log: {
        Row: {
          anomaly_score: number | null
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          location_data: Json | null
          security_flags: string[] | null
          session_end: string | null
          session_id: string
          session_start: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          anomaly_score?: number | null
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          location_data?: Json | null
          security_flags?: string[] | null
          session_end?: string | null
          session_id: string
          session_start?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          anomaly_score?: number | null
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          location_data?: Json | null
          security_flags?: string[] | null
          session_end?: string | null
          session_id?: string
          session_start?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          base_rate: number
          countries: string[]
          created_at: string
          currency: string
          estimated_days_max: number
          estimated_days_min: number
          free_shipping_threshold: number | null
          id: string
          is_active: boolean
          merchant_id: string
          name: string
          per_item_rate: number
          regions: string[]
          updated_at: string
        }
        Insert: {
          base_rate?: number
          countries?: string[]
          created_at?: string
          currency?: string
          estimated_days_max?: number
          estimated_days_min?: number
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          merchant_id: string
          name: string
          per_item_rate?: number
          regions?: string[]
          updated_at?: string
        }
        Update: {
          base_rate?: number
          countries?: string[]
          created_at?: string
          currency?: string
          estimated_days_max?: number
          estimated_days_min?: number
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          merchant_id?: string
          name?: string
          per_item_rate?: number
          regions?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      smart_lists: {
        Row: {
          auto_update: boolean | null
          created_at: string
          criteria: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_update?: boolean | null
          created_at?: string
          criteria?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_update?: boolean | null
          created_at?: string
          criteria?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          images: string[] | null
          likes_count: number | null
          outfit_items: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          images?: string[] | null
          likes_count?: number | null
          outfit_items?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          likes_count?: number | null
          outfit_items?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_analytics: {
        Row: {
          average_transaction_value: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          foot_traffic: number | null
          id: string
          merchant_id: string
          peak_hours: Json | null
          staff_performance: Json | null
          store_location_id: string | null
          top_selling_items: Json | null
          total_revenue: number | null
          total_transactions: number | null
        }
        Insert: {
          average_transaction_value?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          foot_traffic?: number | null
          id?: string
          merchant_id: string
          peak_hours?: Json | null
          staff_performance?: Json | null
          store_location_id?: string | null
          top_selling_items?: Json | null
          total_revenue?: number | null
          total_transactions?: number | null
        }
        Update: {
          average_transaction_value?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          foot_traffic?: number | null
          id?: string
          merchant_id?: string
          peak_hours?: Json | null
          staff_performance?: Json | null
          store_location_id?: string | null
          top_selling_items?: Json | null
          total_revenue?: number | null
          total_transactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_analytics_store_location_id_fkey"
            columns: ["store_location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      store_locations: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          location_name: string
          manager_contact: string | null
          manager_name: string | null
          merchant_id: string
          metadata: Json | null
          operating_hours: Json | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          location_name: string
          manager_contact?: string | null
          manager_name?: string | null
          merchant_id: string
          metadata?: Json | null
          operating_hours?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          location_name?: string
          manager_contact?: string | null
          manager_name?: string | null
          merchant_id?: string
          metadata?: Json | null
          operating_hours?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      store_staff: {
        Row: {
          created_at: string | null
          hired_date: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          merchant_id: string
          permissions: Json | null
          pin_hash: string | null
          role: string
          staff_email: string | null
          staff_name: string
          staff_phone: string | null
          store_location_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          merchant_id: string
          permissions?: Json | null
          pin_hash?: string | null
          role: string
          staff_email?: string | null
          staff_name: string
          staff_phone?: string | null
          store_location_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          merchant_id?: string
          permissions?: Json | null
          pin_hash?: string | null
          role?: string
          staff_email?: string | null
          staff_name?: string
          staff_phone?: string | null
          store_location_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_staff_store_location_id_fkey"
            columns: ["store_location_id"]
            isOneToOne: false
            referencedRelation: "store_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      style_analysis_history: {
        Row: {
          analysis_results: Json
          analysis_type: string
          created_at: string | null
          id: string
          insights: string[] | null
          recommendations: string[] | null
          user_id: string
        }
        Insert: {
          analysis_results: Json
          analysis_type: string
          created_at?: string | null
          id?: string
          insights?: string[] | null
          recommendations?: string[] | null
          user_id: string
        }
        Update: {
          analysis_results?: Json
          analysis_type?: string
          created_at?: string | null
          id?: string
          insights?: string[] | null
          recommendations?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      style_challenges: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          difficulty: string
          end_date: string
          id: string
          is_trending: boolean | null
          participants_count: number | null
          prize: string
          start_date: string
          status: string
          submissions_count: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          difficulty: string
          end_date: string
          id?: string
          is_trending?: boolean | null
          participants_count?: number | null
          prize: string
          start_date: string
          status?: string
          submissions_count?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          difficulty?: string
          end_date?: string
          id?: string
          is_trending?: boolean | null
          participants_count?: number | null
          prize?: string
          start_date?: string
          status?: string
          submissions_count?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      style_evolution_log: {
        Row: {
          brand_diversity: number | null
          color_usage: Json | null
          created_at: string | null
          date: string
          experimentation_score: number | null
          id: string
          outfit_choices: Json | null
          style_metrics: Json
          user_id: string
        }
        Insert: {
          brand_diversity?: number | null
          color_usage?: Json | null
          created_at?: string | null
          date: string
          experimentation_score?: number | null
          id?: string
          outfit_choices?: Json | null
          style_metrics: Json
          user_id: string
        }
        Update: {
          brand_diversity?: number | null
          color_usage?: Json | null
          created_at?: string | null
          date?: string
          experimentation_score?: number | null
          id?: string
          outfit_choices?: Json | null
          style_metrics?: Json
          user_id?: string
        }
        Relationships: []
      }
      style_preferences: {
        Row: {
          body_type: string | null
          budget_range: Json | null
          created_at: string | null
          favorite_brands: string[] | null
          favorite_colors: string[] | null
          id: string
          preferred_occasions: string[] | null
          size_preferences: Json | null
          style_keywords: string[] | null
          sustainability_priority: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body_type?: string | null
          budget_range?: Json | null
          created_at?: string | null
          favorite_brands?: string[] | null
          favorite_colors?: string[] | null
          id?: string
          preferred_occasions?: string[] | null
          size_preferences?: Json | null
          style_keywords?: string[] | null
          sustainability_priority?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body_type?: string | null
          budget_range?: Json | null
          created_at?: string | null
          favorite_brands?: string[] | null
          favorite_colors?: string[] | null
          id?: string
          preferred_occasions?: string[] | null
          size_preferences?: Json | null
          style_keywords?: string[] | null
          sustainability_priority?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      style_trends: {
        Row: {
          demographics: Json | null
          description: string | null
          first_detected_at: string | null
          id: string
          popularity_score: number | null
          related_items: Json | null
          season: string[] | null
          trend_category: string
          trend_name: string
          trend_status: string | null
          updated_at: string | null
        }
        Insert: {
          demographics?: Json | null
          description?: string | null
          first_detected_at?: string | null
          id?: string
          popularity_score?: number | null
          related_items?: Json | null
          season?: string[] | null
          trend_category: string
          trend_name: string
          trend_status?: string | null
          updated_at?: string | null
        }
        Update: {
          demographics?: Json | null
          description?: string | null
          first_detected_at?: string | null
          id?: string
          popularity_score?: number | null
          related_items?: Json | null
          season?: string[] | null
          trend_category?: string
          trend_name?: string
          trend_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          is_internal: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          id: string
          merchant_id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          id?: string
          merchant_id: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          id?: string
          merchant_id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      sustainability_metrics: {
        Row: {
          circular_economy_score: number | null
          co2_saved_kg: number | null
          created_at: string | null
          id: string
          items_purchased_secondhand: number | null
          items_resold: number | null
          updated_at: string | null
          user_id: string
          waste_prevented_kg: number | null
          water_saved_liters: number | null
        }
        Insert: {
          circular_economy_score?: number | null
          co2_saved_kg?: number | null
          created_at?: string | null
          id?: string
          items_purchased_secondhand?: number | null
          items_resold?: number | null
          updated_at?: string | null
          user_id: string
          waste_prevented_kg?: number | null
          water_saved_liters?: number | null
        }
        Update: {
          circular_economy_score?: number | null
          co2_saved_kg?: number | null
          created_at?: string | null
          id?: string
          items_purchased_secondhand?: number | null
          items_resold?: number | null
          updated_at?: string | null
          user_id?: string
          waste_prevented_kg?: number | null
          water_saved_liters?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          description: string
          id: string
          metadata: Json | null
          payment_method_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description: string
          id?: string
          metadata?: Json | null
          payment_method_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          metadata?: Json | null
          payment_method_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credibility: {
        Row: {
          average_rating: number | null
          cancelled_transactions: number | null
          created_at: string | null
          credibility_score: number | null
          disputes_against: number | null
          disputes_filed: number | null
          email_verified: boolean | null
          id: string
          id_verified: boolean | null
          negative_reviews: number | null
          phone_verified: boolean | null
          positive_reviews: number | null
          successful_transactions: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
          verified_seller: boolean | null
        }
        Insert: {
          average_rating?: number | null
          cancelled_transactions?: number | null
          created_at?: string | null
          credibility_score?: number | null
          disputes_against?: number | null
          disputes_filed?: number | null
          email_verified?: boolean | null
          id?: string
          id_verified?: boolean | null
          negative_reviews?: number | null
          phone_verified?: boolean | null
          positive_reviews?: number | null
          successful_transactions?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
          verified_seller?: boolean | null
        }
        Update: {
          average_rating?: number | null
          cancelled_transactions?: number | null
          created_at?: string | null
          credibility_score?: number | null
          disputes_against?: number | null
          disputes_filed?: number | null
          email_verified?: boolean | null
          id?: string
          id_verified?: boolean | null
          negative_reviews?: number | null
          phone_verified?: boolean | null
          positive_reviews?: number | null
          successful_transactions?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
          verified_seller?: boolean | null
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
          vto_photo_url: string | null
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
          vto_photo_url?: string | null
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
          vto_photo_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_security_score: {
        Row: {
          created_at: string
          failed_login_attempts: number | null
          id: string
          last_suspicious_activity: string | null
          mfa_enabled: boolean | null
          password_last_changed: string | null
          rate_limit_violations: number | null
          risk_level: string | null
          security_flags: string[] | null
          security_score: number | null
          successful_logins: number | null
          suspicious_activities: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_login_attempts?: number | null
          id?: string
          last_suspicious_activity?: string | null
          mfa_enabled?: boolean | null
          password_last_changed?: string | null
          rate_limit_violations?: number | null
          risk_level?: string | null
          security_flags?: string[] | null
          security_score?: number | null
          successful_logins?: number | null
          suspicious_activities?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed_login_attempts?: number | null
          id?: string
          last_suspicious_activity?: string | null
          mfa_enabled?: boolean | null
          password_last_changed?: string | null
          rate_limit_violations?: number | null
          risk_level?: string | null
          security_flags?: string[] | null
          security_score?: number | null
          successful_logins?: number | null
          suspicious_activities?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_model_preference: string | null
          ai_suggestion_frequency: string | null
          created_at: string
          currency: string | null
          current_vto_photo_id: string | null
          default_payment_method: string | null
          enable_ai_chat: boolean | null
          enable_ai_suggestions: boolean | null
          enable_email_notifications: boolean | null
          enable_marketing_emails: boolean | null
          enable_payment_notifications: boolean | null
          enable_push_notifications: boolean | null
          enable_random_vto_photo: boolean | null
          id: string
          language: string | null
          profile_visibility: string | null
          saved_payment_methods: Json | null
          show_activity_publicly: boolean | null
          show_wardrobe_publicly: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_preference?: string | null
          ai_suggestion_frequency?: string | null
          created_at?: string
          currency?: string | null
          current_vto_photo_id?: string | null
          default_payment_method?: string | null
          enable_ai_chat?: boolean | null
          enable_ai_suggestions?: boolean | null
          enable_email_notifications?: boolean | null
          enable_marketing_emails?: boolean | null
          enable_payment_notifications?: boolean | null
          enable_push_notifications?: boolean | null
          enable_random_vto_photo?: boolean | null
          id?: string
          language?: string | null
          profile_visibility?: string | null
          saved_payment_methods?: Json | null
          show_activity_publicly?: boolean | null
          show_wardrobe_publicly?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_preference?: string | null
          ai_suggestion_frequency?: string | null
          created_at?: string
          currency?: string | null
          current_vto_photo_id?: string | null
          default_payment_method?: string | null
          enable_ai_chat?: boolean | null
          enable_ai_suggestions?: boolean | null
          enable_email_notifications?: boolean | null
          enable_marketing_emails?: boolean | null
          enable_payment_notifications?: boolean | null
          enable_push_notifications?: boolean | null
          enable_random_vto_photo?: boolean | null
          id?: string
          language?: string | null
          profile_visibility?: string | null
          saved_payment_methods?: Json | null
          show_activity_publicly?: boolean | null
          show_wardrobe_publicly?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_current_vto_photo_id_fkey"
            columns: ["current_vto_photo_id"]
            isOneToOne: false
            referencedRelation: "vto_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_style_profiles: {
        Row: {
          avoided_brands: string[] | null
          body_type: string | null
          brand_preferences: string[] | null
          budget_range: Json | null
          color_palette: Json | null
          created_at: string | null
          id: string
          last_analysis_at: string | null
          occasion_frequency: Json | null
          preferred_fits: string[] | null
          style_evolution_data: Json | null
          style_personality: string[] | null
          style_preferences: Json | null
          sustainability_preference: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avoided_brands?: string[] | null
          body_type?: string | null
          brand_preferences?: string[] | null
          budget_range?: Json | null
          color_palette?: Json | null
          created_at?: string | null
          id?: string
          last_analysis_at?: string | null
          occasion_frequency?: Json | null
          preferred_fits?: string[] | null
          style_evolution_data?: Json | null
          style_personality?: string[] | null
          style_preferences?: Json | null
          sustainability_preference?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avoided_brands?: string[] | null
          body_type?: string | null
          brand_preferences?: string[] | null
          budget_range?: Json | null
          color_palette?: Json | null
          created_at?: string | null
          id?: string
          last_analysis_at?: string | null
          occasion_frequency?: Json | null
          preferred_fits?: string[] | null
          style_evolution_data?: Json | null
          style_personality?: string[] | null
          style_preferences?: Json | null
          sustainability_preference?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_styles: {
        Row: {
          color_palette: Json | null
          created_at: string
          id: string
          inspiration_images: string[] | null
          is_active: boolean | null
          preferred_categories: Json | null
          style_description: string | null
          style_keywords: string[] | null
          style_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color_palette?: Json | null
          created_at?: string
          id?: string
          inspiration_images?: string[] | null
          is_active?: boolean | null
          preferred_categories?: Json | null
          style_description?: string | null
          style_keywords?: string[] | null
          style_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color_palette?: Json | null
          created_at?: string
          id?: string
          inspiration_images?: string[] | null
          is_active?: boolean | null
          preferred_categories?: Json | null
          style_description?: string | null
          style_keywords?: string[] | null
          style_name?: string
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
      user_theme_settings: {
        Row: {
          accent_color: string
          animations_enabled: boolean
          background_style: string
          border_radius: string
          created_at: string
          font_family: string
          id: string
          primary_color: string
          secondary_color: string
          theme_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          animations_enabled?: boolean
          background_style?: string
          border_radius?: string
          created_at?: string
          font_family?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          theme_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          animations_enabled?: boolean
          background_style?: string
          border_radius?: string
          created_at?: string
          font_family?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          theme_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vto_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          item_id: string | null
          merchant_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          item_id?: string | null
          merchant_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          item_id?: string | null
          merchant_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vto_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vto_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      vto_generation_log: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          image_size_bytes: number | null
          processing_time_ms: number | null
          result_url: string | null
          status: string
          user_id: string
          user_photo_url: string | null
          wardrobe_item_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          image_size_bytes?: number | null
          processing_time_ms?: number | null
          result_url?: string | null
          status: string
          user_id: string
          user_photo_url?: string | null
          wardrobe_item_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          image_size_bytes?: number | null
          processing_time_ms?: number | null
          result_url?: string | null
          status?: string
          user_id?: string
          user_photo_url?: string | null
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vto_generation_log_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      vto_item_status: {
        Row: {
          created_at: string
          id: string
          image_quality_checks: Json | null
          is_vto_ready: boolean | null
          item_id: string
          item_type: string
          last_checked_at: string | null
          material_data_complete: boolean | null
          missing_requirements: Json | null
          quality_score: number | null
          size_data_complete: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_quality_checks?: Json | null
          is_vto_ready?: boolean | null
          item_id: string
          item_type: string
          last_checked_at?: string | null
          material_data_complete?: boolean | null
          missing_requirements?: Json | null
          quality_score?: number | null
          size_data_complete?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_quality_checks?: Json | null
          is_vto_ready?: boolean | null
          item_id?: string
          item_type?: string
          last_checked_at?: string | null
          material_data_complete?: boolean | null
          missing_requirements?: Json | null
          quality_score?: number | null
          size_data_complete?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      vto_merchant_settings: {
        Row: {
          auto_generate_vto: boolean | null
          conversion_tracking_enabled: boolean | null
          created_at: string
          fit_confidence_threshold: number | null
          id: string
          merchant_id: string
          require_vto_for_listing: boolean | null
          size_recommendation_enabled: boolean | null
          updated_at: string
          vto_enabled: boolean | null
        }
        Insert: {
          auto_generate_vto?: boolean | null
          conversion_tracking_enabled?: boolean | null
          created_at?: string
          fit_confidence_threshold?: number | null
          id?: string
          merchant_id: string
          require_vto_for_listing?: boolean | null
          size_recommendation_enabled?: boolean | null
          updated_at?: string
          vto_enabled?: boolean | null
        }
        Update: {
          auto_generate_vto?: boolean | null
          conversion_tracking_enabled?: boolean | null
          created_at?: string
          fit_confidence_threshold?: number | null
          id?: string
          merchant_id?: string
          require_vto_for_listing?: boolean | null
          size_recommendation_enabled?: boolean | null
          updated_at?: string
          vto_enabled?: boolean | null
        }
        Relationships: []
      }
      vto_photos: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          photo_url: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          photo_url: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          photo_url?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vto_quality_metrics: {
        Row: {
          created_at: string
          feedback_comment: string | null
          id: string
          quality_rating: number | null
          reported_issues: string[] | null
          user_id: string
          vto_log_id: string
        }
        Insert: {
          created_at?: string
          feedback_comment?: string | null
          id?: string
          quality_rating?: number | null
          reported_issues?: string[] | null
          user_id: string
          vto_log_id: string
        }
        Update: {
          created_at?: string
          feedback_comment?: string | null
          id?: string
          quality_rating?: number | null
          reported_issues?: string[] | null
          user_id?: string
          vto_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vto_quality_metrics_vto_log_id_fkey"
            columns: ["vto_log_id"]
            isOneToOne: false
            referencedRelation: "vto_generation_log"
            referencedColumns: ["id"]
          },
        ]
      }
      vto_rate_limits: {
        Row: {
          created_at: string
          daily_count: number
          daily_reset_at: string
          hourly_count: number
          hourly_reset_at: string
          id: string
          last_generation_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_count?: number
          daily_reset_at?: string
          hourly_count?: number
          hourly_reset_at?: string
          id?: string
          last_generation_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_count?: number
          daily_reset_at?: string
          hourly_count?: number
          hourly_reset_at?: string
          id?: string
          last_generation_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vto_sessions: {
        Row: {
          confidence_score: number | null
          created_at: string
          fit_score: number | null
          id: string
          item_id: string
          item_type: string
          photo_data: Json | null
          result_image_url: string | null
          session_data: Json
          updated_at: string
          user_id: string
          user_measurements: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          fit_score?: number | null
          id?: string
          item_id: string
          item_type: string
          photo_data?: Json | null
          result_image_url?: string | null
          session_data?: Json
          updated_at?: string
          user_id: string
          user_measurements?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          fit_score?: number | null
          id?: string
          item_id?: string
          item_type?: string
          photo_data?: Json | null
          result_image_url?: string | null
          session_data?: Json
          updated_at?: string
          user_id?: string
          user_measurements?: Json | null
        }
        Relationships: []
      }
      vto_user_preferences: {
        Row: {
          auto_delete_after_days: number | null
          body_measurements: Json | null
          created_at: string
          enable_vto: boolean | null
          id: string
          preferred_fit_style: string | null
          save_try_on_photos: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_delete_after_days?: number | null
          body_measurements?: Json | null
          created_at?: string
          enable_vto?: boolean | null
          id?: string
          preferred_fit_style?: string | null
          save_try_on_photos?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_delete_after_days?: number | null
          body_measurements?: Json | null
          created_at?: string
          enable_vto?: boolean | null
          id?: string
          preferred_fit_style?: string | null
          save_try_on_photos?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wardrobe_collection_items: {
        Row: {
          added_at: string
          collection_id: string
          id: string
          position: number | null
          wardrobe_item_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          id?: string
          position?: number | null
          wardrobe_item_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          id?: string
          position?: number | null
          wardrobe_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wardrobe_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wardrobe_collection_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobe_collections: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
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
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wardrobe_components: {
        Row: {
          capacity: number | null
          color: string | null
          component_type: string
          created_at: string | null
          current_items: number | null
          dimensions: Json
          id: string
          name: string
          notes: string | null
          position: Json
          updated_at: string | null
          user_id: string
          wardrobe_id: string
        }
        Insert: {
          capacity?: number | null
          color?: string | null
          component_type: string
          created_at?: string | null
          current_items?: number | null
          dimensions: Json
          id?: string
          name: string
          notes?: string | null
          position?: Json
          updated_at?: string | null
          user_id: string
          wardrobe_id: string
        }
        Update: {
          capacity?: number | null
          color?: string | null
          component_type?: string
          created_at?: string | null
          current_items?: number | null
          dimensions?: Json
          id?: string
          name?: string
          notes?: string | null
          position?: Json
          updated_at?: string | null
          user_id?: string
          wardrobe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wardrobe_components_wardrobe_id_fkey"
            columns: ["wardrobe_id"]
            isOneToOne: false
            referencedRelation: "wardrobes"
            referencedColumns: ["id"]
          },
        ]
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
          component_layout: Json | null
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
          component_layout?: Json | null
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
          component_layout?: Json | null
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
      analyze_user_style: {
        Args: { p_user_id: string }
        Returns: Json
      }
      analyze_vto_quality: {
        Args: {
          p_feedback_comment?: string
          p_log_id: string
          p_quality_rating: number
          p_reported_issues?: string[]
        }
        Returns: string
      }
      authenticate_pos_terminal: {
        Args: {
          p_auth_token: string
          p_device_id: string
          p_terminal_code: string
        }
        Returns: Json
      }
      calculate_merchant_trust_score: {
        Args: { p_merchant_id: string }
        Returns: number
      }
      calculate_user_credibility: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_user_security_score: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_vto_roi: {
        Args: {
          end_date?: string
          merchant_id_param: string
          start_date?: string
        }
        Returns: Json
      }
      can_access_collection: {
        Args: { collection_id_param: string; user_id_param?: string }
        Returns: boolean
      }
      check_ai_rate_limit: {
        Args: { p_service_type: string; p_user_id: string }
        Returns: Json
      }
      check_collection_rate_limit: {
        Args: {
          action_type: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: Json
      }
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
      check_ip_reputation: {
        Args: { p_ip_address: unknown }
        Returns: {
          is_blocked: boolean
          reputation_score: number
          threat_level: string
        }[]
      }
      check_market_purchase_limit: {
        Args: { p_amount: number; p_user_id: string }
        Returns: {
          allowed: boolean
          daily_remaining: number
          hourly_remaining: number
          reason: string
        }[]
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
      check_vto_rate_limit: {
        Args: { p_user_id: string }
        Returns: {
          allowed: boolean
          daily_remaining: number
          hourly_remaining: number
          reset_time: string
        }[]
      }
      create_invitation_admin: {
        Args: { invitation_email: string; invited_by_admin?: string }
        Returns: Json
      }
      create_notification: {
        Args: {
          notification_action_url?: string
          notification_data?: Json
          notification_message: string
          notification_title: string
          notification_type: string
          target_user_id: string
        }
        Returns: string
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
      decrypt_customer_data: {
        Args: { encrypted_text: string; order_salt?: string }
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
      encrypt_customer_data: {
        Args: { data_text: string; order_salt?: string }
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
      evaluate_smart_list: {
        Args: { list_id_param: string }
        Returns: {
          item_category: string
          item_color: string
          item_id: string
          item_name: string
          match_score: number
        }[]
      }
      get_collection_secure: {
        Args: { collection_id_param: string }
        Returns: {
          cover_image: string
          created_at: string
          description: string
          id: string
          is_public: boolean
          name: string
        }[]
      }
      get_customer_data_secure: {
        Args: { order_id_param: string }
        Returns: {
          billing_address: Json
          customer_email: string
          customer_name: string
          customer_phone: string
          shipping_address: Json
        }[]
      }
      get_merchant_contact_public: {
        Args: { page_id: string }
        Returns: Json
      }
      get_merchant_contact_safe: {
        Args: { page_id: string; requesting_user_id: string }
        Returns: Json
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
      get_profile_contact_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          social_facebook: string
          social_instagram: string
          social_tiktok: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_backup_code: {
        Args: { code: string }
        Returns: string
      }
      hash_invitation_token: {
        Args: { token: string }
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
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_merchant: {
        Args: { _user_id?: string }
        Returns: boolean
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
      log_admin_action: {
        Args: { action_type: string; details?: Json; resource_name: string }
        Returns: boolean
      }
      log_market_transaction: {
        Args: {
          p_amount: number
          p_buyer_id: string
          p_fraud_score?: number
          p_item_id: string
          p_merchant_id: string
          p_status: string
        }
        Returns: string
      }
      log_merchant_sensitive_access: {
        Args: { accessed_fields: string[]; merchant_profile_id: string }
        Returns: boolean
      }
      log_security_incident: {
        Args: {
          p_details?: Json
          p_incident_type: string
          p_severity: string
          p_user_id?: string
        }
        Returns: string
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
      log_user_activity: {
        Args: { activity_data_param?: Json; activity_type_param: string }
        Returns: string
      }
      log_vto_generation: {
        Args: {
          p_error_message?: string
          p_processing_time_ms?: number
          p_result_url?: string
          p_status: string
          p_user_id: string
          p_user_photo_url: string
          p_wardrobe_item_id: string
        }
        Returns: string
      }
      mask_contact_data: {
        Args: { data_text: string; data_type: string }
        Returns: string
      }
      mask_email: {
        Args: { email: string }
        Returns: string
      }
      mask_phone: {
        Args: { phone: string }
        Returns: string
      }
      process_pos_transaction: {
        Args: {
          p_amount: number
          p_items: Json
          p_payment_method: string
          p_staff_id?: string
          p_terminal_id: string
          p_transaction_type: string
        }
        Returns: Json
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
      sync_store_inventory: {
        Args: {
          p_merchant_id: string
          p_sync_type?: string
          p_terminal_id: string
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
      track_ai_usage: {
        Args: {
          p_cost_credits?: number
          p_service_type: string
          p_tokens_used?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_challenge_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      update_credibility_score: {
        Args: { user_id_param: string }
        Returns: undefined
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
      upsert_style_profile: {
        Args: { p_profile_data: Json; p_user_id: string }
        Returns: string
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
      verify_invitation_token: {
        Args: { input_token: string; stored_hash: string }
        Returns: boolean
      }
      verify_staff_pin: {
        Args: { p_pin: string; p_staff_id: string }
        Returns: boolean
      }
      verify_totp_secret: {
        Args: { input_code: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "merchant" | "professional" | "user"
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
      app_role: ["admin", "merchant", "professional", "user"],
      auth_level: ["base", "intermediate", "advanced"],
      user_role: ["private", "professional", "merchant", "admin"],
    },
  },
} as const
