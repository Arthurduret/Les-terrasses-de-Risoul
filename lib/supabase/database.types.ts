// Types générés à la main d'après le modèle de données décrit dans CLAUDE.md.
// À remplacer par `npx supabase gen types typescript` une fois le projet Supabase créé.

export type AvailabilityStatus = "blocked" | "booked";
export type BookingRequestStatus = "pending" | "confirmed" | "declined";

export interface Database {
  public: {
    Tables: {
      availability: {
        Row: {
          id: string;
          date: string;
          status: AvailabilityStatus;
          note: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          status: AvailabilityStatus;
          note?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          status?: AvailabilityStatus;
          note?: string | null;
        };
      };
      pricing_rules: {
        Row: {
          id: string;
          label: string;
          price_per_night: number;
          min_nights: number | null;
          discount_percent: number | null;
          season_start: string | null;
          season_end: string | null;
        };
        Insert: {
          id?: string;
          label: string;
          price_per_night: number;
          min_nights?: number | null;
          discount_percent?: number | null;
          season_start?: string | null;
          season_end?: string | null;
        };
        Update: {
          id?: string;
          label?: string;
          price_per_night?: number;
          min_nights?: number | null;
          discount_percent?: number | null;
          season_start?: string | null;
          season_end?: string | null;
        };
      };
      settings: {
        Row: {
          key: string;
          value: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
      };
      booking_requests: {
        Row: {
          id: string;
          start_date: string;
          end_date: string;
          name: string;
          email: string;
          phone: string;
          message: string | null;
          status: BookingRequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          start_date: string;
          end_date: string;
          name: string;
          email: string;
          phone: string;
          message?: string | null;
          status?: BookingRequestStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          start_date?: string;
          end_date?: string;
          name?: string;
          email?: string;
          phone?: string;
          message?: string | null;
          status?: BookingRequestStatus;
          created_at?: string;
        };
      };
    };
  };
}
