import type {
  PostgrestResponse,
  PostgrestSingleResponse,
  PostgrestMaybeSingleResponse,
} from '@supabase/supabase-js';

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type AnyResponse<T> =
  | PostgrestResponse<T>
  | PostgrestSingleResponse<T>
  | PostgrestMaybeSingleResponse<T>;

export type Success<T> = Extract<PostgrestSingleResponse<T>, { error: null }>;

export interface SupabaseDatabase {
  public: {
    Tables: Record<string, { Row: unknown }>;
    Views: Record<string, { Row: unknown }>;
  };
  __InternalSupabase?: {
    PostgrestVersion: '12';
  };
}
