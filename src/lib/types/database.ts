export type ProjectType = "kitchen" | "bathroom" | "flooring";
export type PropertyType = "residential" | "commercial";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  project_type: ProjectType;
  property_type: PropertyType;
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  description: string | null;
  status: AppointmentStatus;
  created_at: string;
  admin_notes: string | null;
  follow_up_date: string | null;
  follow_up_sent: boolean;
  customer_address: string | null;
  updated_at: string;
}

export interface PortfolioPhoto {
  id: string;
  category: ProjectType;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export type EmailType = "confirmation" | "follow_up" | "reminder";
export type EmailStatus = "sent" | "failed" | "skipped";

export interface EmailLog {
  id: string;
  appointment_id: string;
  email_type: EmailType;
  subject: string;
  recipient_email: string;
  status: EmailStatus;
  sent_at: string;
  created_at: string;
}

export interface QrCode {
  id: string;
  slug: string;
  label: string;
  target_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QrScan {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  user_agent: string | null;
  referrer: string | null;
  ip_address: string | null;
}

export interface EmailSettings {
  id: string;
  confirmation_enabled: boolean;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  follow_up_enabled: boolean;
  follow_up_days_after: number;
  follow_up_default_message: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: Appointment;
        Insert: {
          id?: string;
          project_type: ProjectType;
          property_type: PropertyType;
          appointment_date: string;
          appointment_time: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          description?: string | null;
          status?: AppointmentStatus;
          created_at?: string;
          admin_notes?: string | null;
          follow_up_date?: string | null;
          follow_up_sent?: boolean;
          customer_address?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_type?: ProjectType;
          property_type?: PropertyType;
          appointment_date?: string;
          appointment_time?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          description?: string | null;
          status?: AppointmentStatus;
          created_at?: string;
          admin_notes?: string | null;
          follow_up_date?: string | null;
          follow_up_sent?: boolean;
          customer_address?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolio_photos: {
        Row: PortfolioPhoto;
        Insert: {
          id?: string;
          category: ProjectType;
          image_url: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: ProjectType;
          image_url?: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      time_slots: {
        Row: TimeSlot;
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      email_log: {
        Row: EmailLog;
        Insert: {
          id?: string;
          appointment_id: string;
          email_type: EmailType;
          subject: string;
          recipient_email: string;
          status: EmailStatus;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          email_type?: EmailType;
          subject?: string;
          recipient_email?: string;
          status?: EmailStatus;
          sent_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      qr_codes: {
        Row: QrCode;
        Insert: {
          id?: string;
          slug: string;
          label: string;
          target_url: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          label?: string;
          target_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_settings: {
        Row: EmailSettings;
        Insert: {
          id?: string;
          confirmation_enabled?: boolean;
          reminder_enabled?: boolean;
          reminder_hours_before?: number;
          follow_up_enabled?: boolean;
          follow_up_days_after?: number;
          follow_up_default_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          confirmation_enabled?: boolean;
          reminder_enabled?: boolean;
          reminder_hours_before?: number;
          follow_up_enabled?: boolean;
          follow_up_days_after?: number;
          follow_up_default_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      qr_scans: {
        Row: QrScan;
        Insert: {
          id?: string;
          qr_code_id: string;
          scanned_at?: string;
          user_agent?: string | null;
          referrer?: string | null;
          ip_address?: string | null;
        };
        Update: {
          id?: string;
          qr_code_id?: string;
          scanned_at?: string;
          user_agent?: string | null;
          referrer?: string | null;
          ip_address?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_type: ProjectType;
      property_type: PropertyType;
      appointment_status: AppointmentStatus;
    };
  };
}
