"use client";

import { createContext, useContext } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../../supabase/client";

interface SupabaseContextValue {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const supabase = createClient();

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextValue {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  
  return context;
}