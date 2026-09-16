export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          author_id: string
          author_email: string
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          author_id: string
          author_email: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          author_id?: string
          author_email?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"]
export type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"]
