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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          job_title: string | null
          department: string | null
          timezone: string
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          department?: string | null
          timezone?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          department?: string | null
          timezone?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          domain: string | null
          industry: string | null
          size: string | null
          website: string | null
          phone: string | null
          email: string | null
          address: Json
          description: string | null
          logo_url: string | null
          annual_revenue: number | null
          founded_year: number | null
          linkedin_url: string | null
          twitter_url: string | null
          tags: string[]
          custom_fields: Json
          owner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          industry?: string | null
          size?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          address?: Json
          description?: string | null
          logo_url?: string | null
          annual_revenue?: number | null
          founded_year?: number | null
          linkedin_url?: string | null
          twitter_url?: string | null
          tags?: string[]
          custom_fields?: Json
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          industry?: string | null
          size?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          address?: Json
          description?: string | null
          logo_url?: string | null
          annual_revenue?: number | null
          founded_year?: number | null
          linkedin_url?: string | null
          twitter_url?: string | null
          tags?: string[]
          custom_fields?: Json
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          job_title: string | null
          department: string | null
          company_id: string | null
          lead_source: string | null
          status: string
          address: Json
          linkedin_url: string | null
          twitter_url: string | null
          avatar_url: string | null
          birth_date: string | null
          description: string | null
          tags: string[]
          custom_fields: Json
          last_contacted_at: string | null
          owner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          department?: string | null
          company_id?: string | null
          lead_source?: string | null
          status?: string
          address?: Json
          linkedin_url?: string | null
          twitter_url?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          description?: string | null
          tags?: string[]
          custom_fields?: Json
          last_contacted_at?: string | null
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          department?: string | null
          company_id?: string | null
          lead_source?: string | null
          status?: string
          address?: Json
          linkedin_url?: string | null
          twitter_url?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          description?: string | null
          tags?: string[]
          custom_fields?: Json
          last_contacted_at?: string | null
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          company_name: string | null
          job_title: string | null
          lead_source: string | null
          status: string
          score: number
          description: string | null
          website: string | null
          address: Json
          tags: string[]
          custom_fields: Json
          converted_contact_id: string | null
          converted_deal_id: string | null
          converted_at: string | null
          owner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          job_title?: string | null
          lead_source?: string | null
          status?: string
          score?: number
          description?: string | null
          website?: string | null
          address?: Json
          tags?: string[]
          custom_fields?: Json
          converted_contact_id?: string | null
          converted_deal_id?: string | null
          converted_at?: string | null
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          job_title?: string | null
          lead_source?: string | null
          status?: string
          score?: number
          description?: string | null
          website?: string | null
          address?: Json
          tags?: string[]
          custom_fields?: Json
          converted_contact_id?: string | null
          converted_deal_id?: string | null
          converted_at?: string | null
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pipelines: {
        Row: {
          id: string
          name: string
          description: string | null
          is_default: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_default?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pipeline_stages: {
        Row: {
          id: string
          pipeline_id: string
          name: string
          description: string | null
          color: string
          probability: number
          position: number
          is_won: boolean
          is_lost: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pipeline_id: string
          name: string
          description?: string | null
          color?: string
          probability?: number
          position: number
          is_won?: boolean
          is_lost?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pipeline_id?: string
          name?: string
          description?: string | null
          color?: string
          probability?: number
          position?: number
          is_won?: boolean
          is_lost?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          name: string
          value: number
          currency: string
          pipeline_id: string | null
          stage_id: string | null
          contact_id: string | null
          company_id: string | null
          expected_close_date: string | null
          actual_close_date: string | null
          probability: number
          status: string
          loss_reason: string | null
          description: string | null
          tags: string[]
          custom_fields: Json
          owner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          value?: number
          currency?: string
          pipeline_id?: string | null
          stage_id?: string | null
          contact_id?: string | null
          company_id?: string | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          probability?: number
          status?: string
          loss_reason?: string | null
          description?: string | null
          tags?: string[]
          custom_fields?: Json
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          value?: number
          currency?: string
          pipeline_id?: string | null
          stage_id?: string | null
          contact_id?: string | null
          company_id?: string | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          probability?: number
          status?: string
          loss_reason?: string | null
          description?: string | null
          tags?: string[]
          custom_fields?: Json
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          type: string
          subject: string
          description: string | null
          status: string
          due_date: string | null
          completed_at: string | null
          duration_minutes: number | null
          outcome: string | null
          contact_id: string | null
          company_id: string | null
          deal_id: string | null
          lead_id: string | null
          assigned_to: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          subject: string
          description?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          outcome?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          lead_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          subject?: string
          description?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          outcome?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          lead_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: string
          status: string
          due_date: string | null
          completed_at: string | null
          contact_id: string | null
          company_id: string | null
          deal_id: string | null
          lead_id: string | null
          assigned_to: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority?: string
          status?: string
          due_date?: string | null
          completed_at?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          lead_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: string
          status?: string
          due_date?: string | null
          completed_at?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          lead_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          content: string
          contact_id: string | null
          company_id: string | null
          deal_id: string | null
          lead_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          lead_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          lead_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          category: string | null
          is_shared: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          category?: string | null
          is_shared?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          body?: string
          category?: string | null
          is_shared?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Pipeline = Database['public']['Tables']['pipelines']['Row']
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']

// Extended types with relations
export interface DealWithRelations extends Deal {
  contact?: Contact | null
  company?: Company | null
  stage?: PipelineStage | null
  owner?: Profile | null
}

export interface ContactWithRelations extends Contact {
  company?: Company | null
  owner?: Profile | null
}

export interface ActivityWithRelations extends Activity {
  contact?: Contact | null
  deal?: Deal | null
  lead?: Lead | null
  assigned_user?: Profile | null
}

export interface TaskWithRelations extends Task {
  contact?: Contact | null
  deal?: Deal | null
  assigned_user?: Profile | null
}

