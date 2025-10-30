declare module "@supabase/ssr" {
  import { SupabaseClient } from "@supabase/supabase-js";

  export interface CookieMethods {
    getAll(): Array<{ name: string; value: string }>;
    setAll(
      cookies: Array<{
        name: string;
        value: string;
        options: {
          domain?: string;
          path?: string;
          maxAge?: number;
          httpOnly?: boolean;
          secure?: boolean;
          sameSite?: "lax" | "strict" | "none";
          partitioned?: boolean;
        };
      }>
    ): void;
  }

  export interface CookieOptions {
    cookies: CookieMethods;
  }

  export function createServerClient<
    Database = any,
    SchemaName extends string & keyof Database = "public" extends keyof Database
      ? "public"
      : string & keyof Database
  >(
    supabaseUrl: string,
    supabaseKey: string,
    options: CookieOptions
  ): SupabaseClient<Database, SchemaName>;

  export function createBrowserClient<
    Database = any,
    SchemaName extends string & keyof Database = "public" extends keyof Database
      ? "public"
      : string & keyof Database
  >(
    supabaseUrl: string,
    supabaseKey: string
  ): SupabaseClient<Database, SchemaName>;
}