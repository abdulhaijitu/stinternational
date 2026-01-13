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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_preferences: {
        Row: {
          created_at: string
          dark_mode: boolean | null
          id: string
          language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dark_mode?: boolean | null
          id?: string
          language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dark_mode?: boolean | null
          id?: string
          language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          description_bn: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_bn: string | null
          parent_group: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_bn?: string | null
          parent_group?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_bn?: string | null
          parent_group?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cta_analytics: {
        Row: {
          created_at: string
          cta_variant: string
          event_type: string
          id: string
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          cta_variant: string
          event_type: string
          id?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          cta_variant?: string
          event_type?: string
          id?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      institution_logos: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          company_name: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          shipping_address: string
          shipping_city: string
          shipping_cost: number | null
          shipping_postal_code: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          shipping_address: string
          shipping_city: string
          shipping_cost?: number | null
          shipping_postal_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          shipping_address?: string
          shipping_city?: string
          shipping_cost?: number | null
          shipping_postal_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          module: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          compare_price: number | null
          created_at: string
          description: string | null
          description_bn: string | null
          features: string[] | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          name_bn: string | null
          price: number
          short_description: string | null
          short_description_bn: string | null
          sku: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          name_bn?: string | null
          price: number
          short_description?: string | null
          short_description_bn?: string | null
          sku?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          name_bn?: string | null
          price?: number
          short_description?: string | null
          short_description_bn?: string | null
          sku?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          additional_notes: string | null
          budget_range: string | null
          company_name: string
          company_type: string
          contact_person: string
          created_at: string
          delivery_address: string
          delivery_city: string
          delivery_urgency: string
          email: string
          id: string
          phone: string
          preferred_payment: string | null
          product_category: string
          product_details: string
          quantity: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          budget_range?: string | null
          company_name: string
          company_type: string
          contact_person: string
          created_at?: string
          delivery_address: string
          delivery_city: string
          delivery_urgency: string
          email: string
          id?: string
          phone: string
          preferred_payment?: string | null
          product_category: string
          product_details: string
          quantity: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          budget_range?: string | null
          company_name?: string
          company_type?: string
          contact_person?: string
          created_at?: string
          delivery_address?: string
          delivery_city?: string
          delivery_urgency?: string
          email?: string
          id?: string
          phone?: string
          preferred_payment?: string | null
          product_category?: string
          product_details?: string
          quantity?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          client_name: string
          company_name: string
          created_at: string
          designation: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          quote: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_name: string
          company_name: string
          created_at?: string
          designation?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          quote: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_name?: string
          company_name?: string
          created_at?: string
          designation?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          quote?: string
          rating?: number | null
          updated_at?: string
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
      ux_telemetry_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_action: string | null
          event_category: string
          event_label: string | null
          event_type: string
          event_value: string | null
          id: string
          page_url: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_action?: string | null
          event_category: string
          event_label?: string | null
          event_type: string
          event_value?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_action?: string | null
          event_category?: string
          event_label?: string | null
          event_type?: string
          event_value?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "accounts"
        | "sales"
      order_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method: "cash_on_delivery" | "bank_transfer" | "online_payment"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "accounts",
        "sales",
      ],
      order_status: [
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cash_on_delivery", "bank_transfer", "online_payment"],
    },
  },
} as const
