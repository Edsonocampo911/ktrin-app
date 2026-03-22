export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'organizer' | 'provider' | 'guest' | 'admin';

export type EventStatus = 
  | 'DRAFT' 
  | 'OPEN' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PARTIALLY_VALIDATED'
  | 'FULLY_VALIDATED'
  | 'CANCELLED'
  | 'POSTPONED'
  | 'POSTPONED_WEATHER';

export type ServiceStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'FULFILLED'
  | 'NOT_VALIDATED'
  | 'CANCELLED';

export type ServiceCategory = 
  | 'CATERING'
  | 'SALONES'
  | 'ENTRETENIMIENTO_INFANTIL'
  | 'FOTOGRAFIA'
  | 'MUSICA'
  | 'DECORACION'
  | 'ALQUILERES'
  | 'OTROS';

export type StrikeType = 'WARNING' | 'MODERATE' | 'SERIOUS' | 'CRITICAL';
export type StrikeTarget = 'provider' | 'organizer';
export type VerificationLevel = 'BASIC' | 'VERIFIED_ID' | 'VERIFIED_BUSINESS';

export type PaymentStatus = 
  | 'PENDING'
  | 'DECLARED_PAID'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_DISPUTED'
  | 'COMMISSION_EXEMPT';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizers: {
        Row: {
          id: string;
          profile_id: string;
          business_name: string | null;
          events_created: number;
          events_completed: number;
          trust_score: number;
          is_first_event: boolean;
          referral_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          business_name?: string | null;
          events_created?: number;
          events_completed?: number;
          trust_score?: number;
          is_first_event?: boolean;
          referral_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          business_name?: string | null;
          events_created?: number;
          events_completed?: number;
          trust_score?: number;
          is_first_event?: boolean;
          referral_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          profile_id: string;
          business_name: string;
          description: string | null;
          category: ServiceCategory;
          trust_score: number;
          verification_level: VerificationLevel;
          base_zone: string;
          expanded_zones: string[];
          min_booking_hours: number;
          payment_methods: string[];
          terms_conditions: string | null;
          is_founder: boolean;
          is_ambassador: boolean;
          ambassador_referral_count: number;
          events_completed: number;
          total_earnings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          business_name: string;
          description?: string | null;
          category: ServiceCategory;
          trust_score?: number;
          verification_level?: VerificationLevel;
          base_zone: string;
          expanded_zones?: string[];
          min_booking_hours?: number;
          payment_methods?: string[];
          terms_conditions?: string | null;
          is_founder?: boolean;
          is_ambassador?: boolean;
          ambassador_referral_count?: number;
          events_completed?: number;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          business_name?: string;
          description?: string | null;
          category?: ServiceCategory;
          trust_score?: number;
          verification_level?: VerificationLevel;
          base_zone?: string;
          expanded_zones?: string[];
          min_booking_hours?: number;
          payment_methods?: string[];
          terms_conditions?: string | null;
          is_founder?: boolean;
          is_ambassador?: boolean;
          ambassador_referral_count?: number;
          events_completed?: number;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          description: string | null;
          category: ServiceCategory;
          base_price: number;
          is_active: boolean;
          is_express_package: boolean;
          express_capacity: number | null;
          photos: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name: string;
          description?: string | null;
          category: ServiceCategory;
          base_price: number;
          is_active?: boolean;
          is_express_package?: boolean;
          express_capacity?: number | null;
          photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          name?: string;
          description?: string | null;
          category?: ServiceCategory;
          base_price?: number;
          is_active?: boolean;
          is_express_package?: boolean;
          express_capacity?: number | null;
          photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          description: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          expected_guests: number;
          status: EventStatus;
          invitation_qr_token: string | null;
          invitation_qr_code: string | null;
          backup_validator_id: string | null;
          auto_close_processed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          description?: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          expected_guests?: number;
          status?: EventStatus;
          invitation_qr_token?: string | null;
          invitation_qr_code?: string | null;
          backup_validator_id?: string | null;
          auto_close_processed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          expected_guests?: number;
          status?: EventStatus;
          invitation_qr_token?: string | null;
          invitation_qr_code?: string | null;
          backup_validator_id?: string | null;
          auto_close_processed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_services: {
        Row: {
          id: string;
          event_id: string;
          service_id: string;
          provider_id: string;
          agreed_price: number;
          status: ServiceStatus;
          payment_status: PaymentStatus;
          qr_token: string | null;
          qr_code: string | null;
          qr_expires_at: string | null;
          qr_used: boolean;
          commission_rate: number;
          commission_amount: number;
          is_commission_exempt: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          service_id: string;
          provider_id: string;
          agreed_price: number;
          status?: ServiceStatus;
          payment_status?: PaymentStatus;
          qr_token?: string | null;
          qr_code?: string | null;
          qr_expires_at?: string | null;
          qr_used?: boolean;
          commission_rate?: number;
          commission_amount?: number;
          is_commission_exempt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          service_id?: string;
          provider_id?: string;
          agreed_price?: number;
          status?: ServiceStatus;
          payment_status?: PaymentStatus;
          qr_token?: string | null;
          qr_code?: string | null;
          qr_expires_at?: string | null;
          qr_used?: boolean;
          commission_rate?: number;
          commission_amount?: number;
          is_commission_exempt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          event_id: string;
          profile_id: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          confirmed: boolean;
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          profile_id?: string | null;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          confirmed?: boolean;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          profile_id?: string | null;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          confirmed?: boolean;
          confirmed_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          message: string;
          type: string;
          data: Json | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          message: string;
          type: string;
          data?: Json | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          message?: string;
          type?: string;
          data?: Json | null;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Functions: {
      validate_qr_secure: {
        Args: {
          p_qr_token: string;
          p_validator_id: string;
          p_arrival_time?: string;
          p_photo_url?: string;
          p_latitude?: number;
          p_longitude?: number;
        };
        Returns: Json;
      };
      auto_close_events: {
        Args: Record<string, never>;
        Returns: void;
      };
      update_trust_score: {
        Args: {
          p_profile_id: string;
        };
        Returns: void;
      };
    };
  };
}


export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  expected_guests: number;
  status: EventStatus;
  invitation_qr_token: string | null;
  invitation_qr_code: string | null;
  backup_validator_id: string | null;
  auto_close_processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventService {
  id: string;
  event_id: string;
  service_id: string;
  provider_id: string;
  agreed_price: number;
  status: string;
  payment_status: string;
  qr_token: string | null;
  qr_code: string | null;
  qr_expires_at: string | null;
  qr_used: boolean;
  commission_rate: number;
  commission_amount: number;
  is_commission_exempt: boolean;
  created_at: string;
  updated_at: string;
  services?: { name: string } | null;
  providers?: { business_name: string } | null;
}

export interface Provider {
  id: string;
  profile_id: string;
  business_name: string;
  description: string | null;
  category: string;
  trust_score: number;
  verification_level: string;
  base_zone: string;
  expanded_zones: string[];
  min_booking_hours: number;
  payment_methods: string[];
  terms_conditions: string | null;
  is_founder: boolean;
  is_ambassador: boolean;
  events_completed: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}