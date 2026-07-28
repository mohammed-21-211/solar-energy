// ======================================================
// أنواع قاعدة البيانات — متوافقة مع Supabase SDK v2
// جداول المشروع في schema خاصة: solar_energy_syria
// (الجداول المشتركة profiles/organization_members تُقرأ عبر Views)
// ======================================================

type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  solar_energy_syria: {
    Tables: {
      products: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string
          price: number
          category: 'panel' | 'battery' | 'inverter' | 'accessory'
          image_url: string
          power_watts: number | null
          capacity_kwh: number | null
          voltage: number | null
          stock_quantity: number
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description: string
          price: number
          category: 'panel' | 'battery' | 'inverter' | 'accessory'
          image_url: string
          power_watts?: number | null
          capacity_kwh?: number | null
          voltage?: number | null
          stock_quantity?: number
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          organization_id?: string
          name?: string
          description?: string
          price?: number
          category?: 'panel' | 'battery' | 'inverter' | 'accessory'
          image_url?: string
          power_watts?: number | null
          capacity_kwh?: number | null
          voltage?: number | null
          stock_quantity?: number
          is_featured?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          shipping_address: string
          phone: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          shipping_address: string
          phone: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          shipping_address?: string
          phone?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          organization_id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          organization_id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
      saved_calculations: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          input_data: Json
          result_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          input_data: Json
          result_data: Json
          created_at?: string
        }
        Update: {
          name?: string
          input_data?: Json
          result_data?: Json
        }
        Relationships: []
      }
    }
    Views: {
      // View للقراءة فقط فوق الجدول المشترك public.profiles
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          created_at: string
        }
        Relationships: []
      }
      // View للقراءة فقط فوق الجدول المشترك public.organization_members
      memberships: {
        Row: {
          organization_id: string
          user_id: string
          role: string
        }
        Relationships: []
      }
    }
    Functions: {
      is_org_admin: {
        Args: { org_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
