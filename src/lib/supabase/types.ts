export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: string;
          plan_started_at: string | null;
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          monthly_ai_credits_used: number;
          monthly_ai_credits_limit: number;
          credits_reset_at: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };
      memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          invited_at: string | null;
          accepted_at: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["memberships"]["Row"]> & {
          organization_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["memberships"]["Row"]>;
      };
      properties: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          postal_code: string | null;
          phone: string | null;
          website: string | null;
          star_rating: number | null;
          property_type: string;
          timezone: string;
          google_place_id: string | null;
          google_business_account_id: string | null;
          google_location_name: string | null;
          booking_com_url: string | null;
          tripadvisor_url: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> & {
          organization_id: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
      };
      brand_voices: {
        Row: {
          id: string;
          property_id: string;
          organization_id: string;
          name: string;
          is_active: boolean;
          tone: string;
          language: string;
          response_length: string;
          greeting_style: string;
          sign_off: string;
          always_include: string[] | null;
          never_include: string[] | null;
          property_facts: Json;
          custom_instructions: string | null;
          example_responses: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["brand_voices"]["Row"]> & {
          property_id: string;
          organization_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["brand_voices"]["Row"]>;
      };
      smart_snippets: {
        Row: {
          id: string;
          property_id: string;
          organization_id: string;
          topic: string;
          topic_keywords: string[];
          sentiment: string;
          talking_points: string[];
          is_active: boolean;
          priority: number;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["smart_snippets"]["Row"]> & {
          property_id: string;
          organization_id: string;
          topic: string;
          topic_keywords: string[];
          talking_points: string[];
        };
        Update: Partial<Database["public"]["Tables"]["smart_snippets"]["Row"]>;
      };
      review_sources: {
        Row: {
          id: string;
          property_id: string;
          organization_id: string;
          platform: string;
          is_connected: boolean;
          connection_type: string | null;
          oauth_access_token: string | null;
          oauth_refresh_token: string | null;
          oauth_token_expires_at: string | null;
          oauth_scopes: string[] | null;
          scrape_url: string | null;
          last_scrape_at: string | null;
          scrape_frequency_minutes: number;
          last_sync_at: string | null;
          last_sync_review_count: number | null;
          sync_error: string | null;
          sync_error_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["review_sources"]["Row"]> & {
          property_id: string;
          organization_id: string;
          platform: string;
        };
        Update: Partial<Database["public"]["Tables"]["review_sources"]["Row"]>;
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          organization_id: string;
          review_source_id: string | null;
          platform: string;
          platform_review_id: string | null;
          reviewer_name: string | null;
          reviewer_avatar_url: string | null;
          reviewer_platform_id: string | null;
          rating: number | null;
          rating_raw: string | null;
          title: string | null;
          body: string | null;
          language: string;
          review_date: string;
          sub_ratings: Json;
          sentiment: string | null;
          sentiment_score: number | null;
          detected_topics: string[] | null;
          detected_language: string | null;
          summary: string | null;
          key_phrases: string[] | null;
          urgency: string;
          response_status: string;
          responded_at: string | null;
          responded_by: string | null;
          assigned_to: string | null;
          is_flagged: boolean;
          flag_reason: string | null;
          notes: string | null;
          import_batch_id: string | null;
          platform_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          property_id: string;
          organization_id: string;
          platform: string;
          review_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      review_responses: {
        Row: {
          id: string;
          review_id: string;
          property_id: string;
          organization_id: string;
          ai_generated_text: string | null;
          edited_text: string | null;
          published_text: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          model_used: string | null;
          generation_time_ms: number | null;
          brand_voice_id: string | null;
          snippets_used: string[] | null;
          status: string;
          published_at: string | null;
          published_by: string | null;
          platform_response_id: string | null;
          publish_error: string | null;
          publish_attempts: number;
          was_auto_generated: boolean;
          was_auto_published: boolean;
          automation_rule_id: string | null;
          version: number;
          previous_version_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["review_responses"]["Row"]> & {
          review_id: string;
          property_id: string;
          organization_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["review_responses"]["Row"]>;
      };
      import_batches: {
        Row: {
          id: string;
          property_id: string;
          organization_id: string;
          uploaded_by: string;
          platform: string;
          filename: string;
          status: string;
          total_rows: number | null;
          imported_count: number;
          skipped_count: number;
          error_count: number;
          errors: Json;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["import_batches"]["Row"]> & {
          property_id: string;
          organization_id: string;
          uploaded_by: string;
          platform: string;
          filename: string;
        };
        Update: Partial<Database["public"]["Tables"]["import_batches"]["Row"]>;
      };
    };
    Functions: {
      get_user_org_ids: { Args: Record<string, never>; Returns: string[] };
      get_user_write_org_ids: { Args: Record<string, never>; Returns: string[] };
      refresh_daily_analytics: { Args: { p_property_id: string; p_date: string }; Returns: void };
    };
  };
}
