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
