export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      contact_details: {
        Row: {
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contact_details_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      contact_requests: {
        Row: {
          created_at: string;
          expires_at: string;
          guardian_id: string;
          guardian_name: string;
          id: string;
          preferred_tutoring_type: Database['public']['Enums']['tutoring_type'] | null;
          reason: string;
          responded_at: string | null;
          status: Database['public']['Enums']['contact_request_status'];
          student_age: number | null;
          student_id: string | null;
          student_name: string;
          student_school_grade: Database['public']['Enums']['school_grade'];
          teacher_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          expires_at?: string;
          guardian_id?: string;
          guardian_name: string;
          id?: string;
          preferred_tutoring_type?: Database['public']['Enums']['tutoring_type'] | null;
          reason: string;
          responded_at?: string | null;
          status?: Database['public']['Enums']['contact_request_status'];
          student_age?: number | null;
          student_id?: string | null;
          student_name: string;
          student_school_grade: Database['public']['Enums']['school_grade'];
          teacher_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          guardian_id?: string;
          guardian_name?: string;
          id?: string;
          preferred_tutoring_type?: Database['public']['Enums']['tutoring_type'] | null;
          reason?: string;
          responded_at?: string | null;
          status?: Database['public']['Enums']['contact_request_status'];
          student_age?: number | null;
          student_id?: string | null;
          student_name?: string;
          student_school_grade?: Database['public']['Enums']['school_grade'];
          teacher_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contact_requests_guardian_id_fkey';
            columns: ['guardian_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contact_requests_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contact_requests_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      favorite_teachers: {
        Row: {
          created_at: string;
          guardian_id: string;
          teacher_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          guardian_id?: string;
          teacher_id: string;
        };
        Update: {
          created_at?: string;
          guardian_id?: string;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorite_teachers_guardian_id_fkey';
            columns: ['guardian_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorite_teachers_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      languages: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          id: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          contact_request_id: string | null;
          created_at: string;
          id: string;
          read_at: string | null;
          review_id: string | null;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          contact_request_id?: string | null;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          review_id?: string | null;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
        };
        Update: {
          contact_request_id?: string | null;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          review_id?: string | null;
          type?: Database['public']['Enums']['notification_type'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_contact_request_id_fkey';
            columns: ['contact_request_id'];
            isOneToOne: false;
            referencedRelation: 'contact_requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_review_id_fkey';
            columns: ['review_id'];
            isOneToOne: false;
            referencedRelation: 'reviews';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string;
          id: string;
          role: Database['public']['Enums']['user_role'] | null;
          terms_accepted_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id: string;
          role?: Database['public']['Enums']['user_role'] | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          role?: Database['public']['Enums']['user_role'] | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          guardian_id: string;
          id: string;
          rating: number;
          reviewer_name: string;
          teacher_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          comment?: string | null;
          created_at?: string;
          guardian_id?: string;
          id?: string;
          rating: number;
          reviewer_name: string;
          teacher_id: string;
          updated_at?: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          guardian_id?: string;
          id?: string;
          rating?: number;
          reviewer_name?: string;
          teacher_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_guardian_id_fkey';
            columns: ['guardian_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      student_subjects: {
        Row: {
          student_id: string;
          subject_id: string;
        };
        ComputedFields: never;
        Insert: {
          student_id: string;
          subject_id: string;
        };
        Update: {
          student_id?: string;
          subject_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_subjects_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_subjects_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
        ];
      };
      students: {
        Row: {
          created_at: string;
          full_name: string;
          guardian_id: string;
          id: string;
          learning_goal: string | null;
          preferred_tutoring_type: Database['public']['Enums']['tutoring_type'] | null;
          school_grade: Database['public']['Enums']['school_grade'];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          full_name: string;
          guardian_id?: string;
          id?: string;
          learning_goal?: string | null;
          preferred_tutoring_type?: Database['public']['Enums']['tutoring_type'] | null;
          school_grade: Database['public']['Enums']['school_grade'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          guardian_id?: string;
          id?: string;
          learning_goal?: string | null;
          preferred_tutoring_type?: Database['public']['Enums']['tutoring_type'] | null;
          school_grade?: Database['public']['Enums']['school_grade'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'students_guardian_id_fkey';
            columns: ['guardian_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          id: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      subscription_payments: {
        Row: {
          amount_cents: number;
          card_brand: string;
          card_last4: string;
          id: string;
          paid_at: string;
          period_end: string;
          period_start: string;
          plan_id: string;
          teacher_id: string;
        };
        ComputedFields: never;
        Insert: {
          amount_cents: number;
          card_brand: string;
          card_last4: string;
          id?: string;
          paid_at?: string;
          period_end: string;
          period_start: string;
          plan_id: string;
          teacher_id: string;
        };
        Update: {
          amount_cents?: number;
          card_brand?: string;
          card_last4?: string;
          id?: string;
          paid_at?: string;
          period_end?: string;
          period_start?: string;
          plan_id?: string;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscription_payments_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'subscription_plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscription_payments_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'subscriptions';
            referencedColumns: ['teacher_id'];
          },
        ];
      };
      subscription_plans: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          price_cents: number;
          trial_days: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id: string;
          is_active?: boolean;
          name: string;
          price_cents: number;
          trial_days?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          price_cents?: number;
          trial_days?: number;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          card_brand: string | null;
          card_exp_month: number | null;
          card_exp_year: number | null;
          card_last4: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          plan_id: string;
          status: Database['public']['Enums']['subscription_status'];
          teacher_id: string;
          trial_ends_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          cancel_at_period_end?: boolean;
          card_brand?: string | null;
          card_exp_month?: number | null;
          card_exp_year?: number | null;
          card_last4?: string | null;
          created_at?: string;
          current_period_end: string;
          current_period_start: string;
          ended_at?: string | null;
          plan_id: string;
          status: Database['public']['Enums']['subscription_status'];
          teacher_id: string;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          card_brand?: string | null;
          card_exp_month?: number | null;
          card_exp_year?: number | null;
          card_last4?: string | null;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          plan_id?: string;
          status?: Database['public']['Enums']['subscription_status'];
          teacher_id?: string;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'subscription_plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: true;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      teacher_documents: {
        Row: {
          created_at: string;
          file_name: string;
          id: string;
          kind: Database['public']['Enums']['teacher_document_kind'];
          storage_path: string;
          teacher_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          file_name: string;
          id?: string;
          kind: Database['public']['Enums']['teacher_document_kind'];
          storage_path: string;
          teacher_id?: string;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          id?: string;
          kind?: Database['public']['Enums']['teacher_document_kind'];
          storage_path?: string;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teacher_documents_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      teacher_languages: {
        Row: {
          language_id: string;
          teacher_id: string;
        };
        ComputedFields: never;
        Insert: {
          language_id: string;
          teacher_id?: string;
        };
        Update: {
          language_id?: string;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teacher_languages_language_id_fkey';
            columns: ['language_id'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'teacher_languages_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      teacher_social_links: {
        Row: {
          network: Database['public']['Enums']['social_network'];
          teacher_id: string;
          url: string;
        };
        ComputedFields: never;
        Insert: {
          network: Database['public']['Enums']['social_network'];
          teacher_id?: string;
          url: string;
        };
        Update: {
          network?: Database['public']['Enums']['social_network'];
          teacher_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teacher_social_links_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      teacher_subjects: {
        Row: {
          subject_id: string;
          teacher_id: string;
        };
        ComputedFields: never;
        Insert: {
          subject_id: string;
          teacher_id?: string;
        };
        Update: {
          subject_id?: string;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teacher_subjects_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'teacher_subjects_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      teacher_verifications: {
        Row: {
          cpf: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          status: Database['public']['Enums']['verification_status'];
          submitted_at: string | null;
          teacher_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          cpf?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          status?: Database['public']['Enums']['verification_status'];
          submitted_at?: string | null;
          teacher_id: string;
          updated_at?: string;
        };
        Update: {
          cpf?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          status?: Database['public']['Enums']['verification_status'];
          submitted_at?: string | null;
          teacher_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teacher_verifications_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: true;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
        ];
      };
      teachers: {
        Row: {
          available_periods: Database['public']['Enums']['day_period'][];
          available_weekdays: number[];
          bio: string | null;
          city: string | null;
          created_at: string;
          education_levels: Database['public']['Enums']['education_level'][];
          hourly_rate_cents: number | null;
          id: string;
          is_published: boolean;
          location: unknown;
          neighborhood: string | null;
          postal_code: string | null;
          rating_average: number | null;
          rating_count: number;
          state: string | null;
          tutoring_types: Database['public']['Enums']['tutoring_type'][];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          available_periods?: Database['public']['Enums']['day_period'][];
          available_weekdays?: number[];
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          education_levels?: Database['public']['Enums']['education_level'][];
          hourly_rate_cents?: number | null;
          id: string;
          is_published?: boolean;
          location?: unknown;
          neighborhood?: string | null;
          postal_code?: string | null;
          rating_average?: number | null;
          rating_count?: number;
          state?: string | null;
          tutoring_types?: Database['public']['Enums']['tutoring_type'][];
          updated_at?: string;
        };
        Update: {
          available_periods?: Database['public']['Enums']['day_period'][];
          available_weekdays?: number[];
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          education_levels?: Database['public']['Enums']['education_level'][];
          hourly_rate_cents?: number | null;
          id?: string;
          is_published?: boolean;
          location?: unknown;
          neighborhood?: string | null;
          postal_code?: string | null;
          rating_average?: number | null;
          rating_count?: number;
          state?: string | null;
          tutoring_types?: Database['public']['Enums']['tutoring_type'][];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teachers_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cancel_subscription: {
        Args: Record<PropertyKey, never>;
        Returns: {
          cancel_at_period_end: boolean;
          card_brand: string | null;
          card_exp_month: number | null;
          card_exp_year: number | null;
          card_last4: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          plan_id: string;
          status: Database['public']['Enums']['subscription_status'];
          teacher_id: string;
          trial_ends_at: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'subscriptions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      expire_contact_requests: { Args: Record<PropertyKey, never>; Returns: undefined };
      is_card_expired: { Args: { exp_month: number; exp_year: number }; Returns: boolean };
      is_valid_cpf: { Args: { cpf: string }; Returns: boolean };
      normalize_search_text: { Args: { value: string }; Returns: string };
      process_due_subscriptions: { Args: Record<PropertyKey, never>; Returns: undefined };
      record_subscription_payment: {
        Args: { p_period_end: string; p_period_start: string; p_teacher_id: string };
        Returns: undefined;
      };
      refresh_teacher_publication: { Args: { p_teacher_id: string }; Returns: undefined };
      resume_subscription: {
        Args: Record<PropertyKey, never>;
        Returns: {
          cancel_at_period_end: boolean;
          card_brand: string | null;
          card_exp_month: number | null;
          card_exp_year: number | null;
          card_last4: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          plan_id: string;
          status: Database['public']['Enums']['subscription_status'];
          teacher_id: string;
          trial_ends_at: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'subscriptions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      search_teachers: {
        Args: {
          p_city?: string;
          p_language_ids?: string[];
          p_latitude?: number;
          p_limit?: number;
          p_longitude?: number;
          p_max_hourly_rate_cents?: number;
          p_min_hourly_rate_cents?: number;
          p_offset?: number;
          p_query?: string;
          p_radius_km?: number;
          p_state?: string;
          p_subject_ids?: string[];
          p_tutoring_types?: Database['public']['Enums']['tutoring_type'][];
          p_weekdays?: number[];
        };
        Returns: {
          avatar_url: string;
          city: string;
          distance_km: number;
          education_levels: Database['public']['Enums']['education_level'][];
          full_name: string;
          hourly_rate_cents: number;
          id: string;
          is_favorite: boolean;
          language_ids: string[];
          neighborhood: string;
          rating_average: number;
          rating_count: number;
          state: string;
          subject_ids: string[];
          total_count: number;
          tutoring_types: Database['public']['Enums']['tutoring_type'][];
        }[];
      };
      start_subscription: {
        Args: {
          p_card_brand?: string;
          p_card_exp_month?: number;
          p_card_exp_year?: number;
          p_card_last4?: string;
          p_plan_id: string;
        };
        Returns: {
          cancel_at_period_end: boolean;
          card_brand: string | null;
          card_exp_month: number | null;
          card_exp_year: number | null;
          card_last4: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          plan_id: string;
          status: Database['public']['Enums']['subscription_status'];
          teacher_id: string;
          trial_ends_at: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'subscriptions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_teacher_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Database['public']['Enums']['verification_status'];
      };
      update_subscription_card: {
        Args: {
          p_card_brand: string;
          p_card_exp_month: number;
          p_card_exp_year: number;
          p_card_last4: string;
        };
        Returns: {
          cancel_at_period_end: boolean;
          card_brand: string | null;
          card_exp_month: number | null;
          card_exp_year: number | null;
          card_last4: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          plan_id: string;
          status: Database['public']['Enums']['subscription_status'];
          teacher_id: string;
          trial_ends_at: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'subscriptions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      contact_request_status: 'pending' | 'accepted' | 'declined' | 'expired';
      day_period: 'morning' | 'afternoon' | 'evening';
      education_level: 'elementary_early' | 'elementary_late' | 'high_school';
      notification_type:
        | 'contact_request_received'
        | 'contact_request_accepted'
        | 'contact_request_declined'
        | 'contact_request_expired'
        | 'review_received'
        | 'teacher_profile_approved'
        | 'teacher_profile_rejected'
        | 'subscription_ended';
      school_grade:
        | 'elementary_1'
        | 'elementary_2'
        | 'elementary_3'
        | 'elementary_4'
        | 'elementary_5'
        | 'elementary_6'
        | 'elementary_7'
        | 'elementary_8'
        | 'elementary_9'
        | 'high_school_1'
        | 'high_school_2'
        | 'high_school_3';
      social_network: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'website';
      subscription_status: 'trialing' | 'active' | 'canceled' | 'expired';
      teacher_document_kind: 'identity' | 'certificate';
      tutoring_type: 'online' | 'in_person';
      user_role: 'guardian' | 'teacher';
      verification_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      contact_request_status: ['pending', 'accepted', 'declined', 'expired'],
      day_period: ['morning', 'afternoon', 'evening'],
      education_level: ['elementary_early', 'elementary_late', 'high_school'],
      notification_type: [
        'contact_request_received',
        'contact_request_accepted',
        'contact_request_declined',
        'contact_request_expired',
        'review_received',
        'teacher_profile_approved',
        'teacher_profile_rejected',
        'subscription_ended',
      ],
      school_grade: [
        'elementary_1',
        'elementary_2',
        'elementary_3',
        'elementary_4',
        'elementary_5',
        'elementary_6',
        'elementary_7',
        'elementary_8',
        'elementary_9',
        'high_school_1',
        'high_school_2',
        'high_school_3',
      ],
      social_network: ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'website'],
      subscription_status: ['trialing', 'active', 'canceled', 'expired'],
      teacher_document_kind: ['identity', 'certificate'],
      tutoring_type: ['online', 'in_person'],
      user_role: ['guardian', 'teacher'],
      verification_status: ['draft', 'pending_review', 'approved', 'rejected'],
    },
  },
} as const;
