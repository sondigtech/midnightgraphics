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
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      ceo_profile: {
        Row: {
          bio_en: string | null
          bio_sw: string | null
          cv_url: string | null
          experience_en: string | null
          experience_sw: string | null
          id: number
          name: string
          philosophy_en: string | null
          philosophy_sw: string | null
          photo_url: string | null
          position_en: string | null
          position_sw: string | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          bio_en?: string | null
          bio_sw?: string | null
          cv_url?: string | null
          experience_en?: string | null
          experience_sw?: string | null
          id?: number
          name?: string
          philosophy_en?: string | null
          philosophy_sw?: string | null
          photo_url?: string | null
          position_en?: string | null
          position_sw?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          bio_en?: string | null
          bio_sw?: string | null
          cv_url?: string | null
          experience_en?: string | null
          experience_sw?: string | null
          id?: number
          name?: string
          philosophy_en?: string | null
          philosophy_sw?: string | null
          photo_url?: string | null
          position_en?: string | null
          position_sw?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          available: boolean
          created_at: string
          cta_text: string | null
          currency: string | null
          description_en: string | null
          description_sw: string | null
          features_en: string[] | null
          features_sw: string[] | null
          id: string
          image_url: string | null
          name_en: string
          name_sw: string | null
          popular: boolean
          price: number | null
          pricing_type: string
          published: boolean
          slug: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          cta_text?: string | null
          currency?: string | null
          description_en?: string | null
          description_sw?: string | null
          features_en?: string[] | null
          features_sw?: string[] | null
          id?: string
          image_url?: string | null
          name_en: string
          name_sw?: string | null
          popular?: boolean
          price?: number | null
          pricing_type?: string
          published?: boolean
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          cta_text?: string | null
          currency?: string | null
          description_en?: string | null
          description_sw?: string | null
          features_en?: string[] | null
          features_sw?: string[] | null
          id?: string
          image_url?: string | null
          name_en?: string
          name_sw?: string | null
          popular?: boolean
          price?: number | null
          pricing_type?: string
          published?: boolean
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          category: string
          client: string | null
          cover_url: string | null
          created_at: string
          deleted_at: string | null
          description_en: string | null
          description_sw: string | null
          featured: boolean
          id: string
          images: Json
          project_date: string | null
          project_url: string | null
          published: boolean
          sort_order: number
          title: string
          tools: string[] | null
          video_url: string | null
        }
        Insert: {
          category?: string
          client?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description_en?: string | null
          description_sw?: string | null
          featured?: boolean
          id?: string
          images?: Json
          project_date?: string | null
          project_url?: string | null
          published?: boolean
          sort_order?: number
          title: string
          tools?: string[] | null
          video_url?: string | null
        }
        Update: {
          category?: string
          client?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description_en?: string | null
          description_sw?: string | null
          featured?: boolean
          id?: string
          images?: Json
          project_date?: string | null
          project_url?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          tools?: string[] | null
          video_url?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          admin_notes: string | null
          attachment_url: string | null
          budget: string | null
          company: string | null
          created_at: string
          deadline: string | null
          description: string | null
          email: string
          extra_info: string | null
          full_name: string
          id: string
          phone: string | null
          service: string | null
          status: Database["public"]["Enums"]["request_status"]
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachment_url?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          email: string
          extra_info?: string | null
          full_name: string
          id?: string
          phone?: string | null
          service?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachment_url?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          email?: string
          extra_info?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          service?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          whatsapp?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          currency: string | null
          description_en: string | null
          description_sw: string | null
          icon: string | null
          id: string
          image_url: string | null
          name_en: string
          name_sw: string | null
          price_from: number | null
          published: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description_en?: string | null
          description_sw?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name_en: string
          name_sw?: string | null
          price_from?: number | null
          published?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          currency?: string | null
          description_en?: string | null
          description_sw?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name_en?: string
          name_sw?: string | null
          price_from?: number | null
          published?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_en: string | null
          about_sw: string | null
          address: string | null
          business_hours: string | null
          company_name: string
          email: string | null
          hero_subtitle_en: string | null
          hero_subtitle_sw: string | null
          hero_title_en: string | null
          hero_title_sw: string | null
          id: number
          instagram: string | null
          logo_url: string | null
          seo_description: string | null
          seo_title: string | null
          stat_clients: string | null
          stat_projects: string | null
          stat_services: string | null
          stat_years: string | null
          tagline_en: string | null
          tagline_sw: string | null
          tiktok: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          about_en?: string | null
          about_sw?: string | null
          address?: string | null
          business_hours?: string | null
          company_name?: string
          email?: string | null
          hero_subtitle_en?: string | null
          hero_subtitle_sw?: string | null
          hero_title_en?: string | null
          hero_title_sw?: string | null
          id?: number
          instagram?: string | null
          logo_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          stat_clients?: string | null
          stat_projects?: string | null
          stat_services?: string | null
          stat_years?: string | null
          tagline_en?: string | null
          tagline_sw?: string | null
          tiktok?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about_en?: string | null
          about_sw?: string | null
          address?: string | null
          business_hours?: string | null
          company_name?: string
          email?: string | null
          hero_subtitle_en?: string | null
          hero_subtitle_sw?: string | null
          hero_title_en?: string | null
          hero_title_sw?: string | null
          id?: number
          instagram?: string | null
          logo_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          stat_clients?: string | null
          stat_projects?: string | null
          stat_services?: string | null
          stat_years?: string | null
          tagline_en?: string | null
          tagline_sw?: string | null
          tiktok?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          company: string | null
          created_at: string
          id: string
          photo_url: string | null
          published: boolean
          quote_en: string
          quote_sw: string | null
          rating: number | null
          sort_order: number
        }
        Insert: {
          client_name: string
          company?: string | null
          created_at?: string
          id?: string
          photo_url?: string | null
          published?: boolean
          quote_en: string
          quote_sw?: string | null
          rating?: number | null
          sort_order?: number
        }
        Update: {
          client_name?: string
          company?: string | null
          created_at?: string
          id?: string
          photo_url?: string | null
          published?: boolean
          quote_en?: string
          quote_sw?: string | null
          rating?: number | null
          sort_order?: number
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
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      request_status:
        | "new"
        | "contacted"
        | "in_progress"
        | "completed"
        | "cancelled"
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
      app_role: ["admin"],
      request_status: [
        "new",
        "contacted",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
