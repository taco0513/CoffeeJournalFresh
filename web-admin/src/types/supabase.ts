export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      coffee_catalog: {
        Row: {
          id: string
          roastery: string
          coffee_name: string
          origin: string | null
          region: string | null
          variety: string | null
          process: string | null
          altitude: string | null
          harvest_year: number | null
          avg_rating: number | null
          total_reviews: number
          common_flavor_notes: string[] | null
          avg_sensory_scores: Json | null
          first_added_by: string | null
          verified_by_moderator: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roastery: string
          coffee_name: string
          origin?: string | null
          region?: string | null
          variety?: string | null
          process?: string | null
          altitude?: string | null
          harvest_year?: number | null
          avg_rating?: number | null
          total_reviews?: number
          common_flavor_notes?: string[] | null
          avg_sensory_scores?: Json | null
          first_added_by?: string | null
          verified_by_moderator?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roastery?: string
          coffee_name?: string
          origin?: string | null
          region?: string | null
          variety?: string | null
          process?: string | null
          altitude?: string | null
          harvest_year?: number | null
          avg_rating?: number | null
          total_reviews?: number
          common_flavor_notes?: string[] | null
          avg_sensory_scores?: Json | null
          first_added_by?: string | null
          verified_by_moderator?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          level: number
          total_tastings: number
          badges: string[]
          is_verified: boolean
          is_moderator: boolean
          followers_count: number
          following_count: number
          privacy_level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          level?: number
          total_tastings?: number
          badges?: string[]
          is_verified?: boolean
          is_moderator?: boolean
          followers_count?: number
          following_count?: number
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          level?: number
          total_tastings?: number
          badges?: string[]
          is_verified?: boolean
          is_moderator?: boolean
          followers_count?: number
          following_count?: number
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_notifications: {
        Row: {
          id: string
          type: 'new_coffee_review' | 'coffee_edit_review' | 'user_report'
          title: string
          message: string
          data: Json | null
          is_read: boolean
          is_resolved: boolean
          created_by: string | null
          created_at: string
          read_at: string | null
          resolved_at: string | null
        }
        Insert: {
          id?: string
          type: 'new_coffee_review' | 'coffee_edit_review' | 'user_report'
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          is_resolved?: boolean
          created_by?: string | null
          created_at?: string
          read_at?: string | null
          resolved_at?: string | null
        }
        Update: {
          id?: string
          type?: 'new_coffee_review' | 'coffee_edit_review' | 'user_report'
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          is_resolved?: boolean
          created_by?: string | null
          created_at?: string
          read_at?: string | null
          resolved_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}