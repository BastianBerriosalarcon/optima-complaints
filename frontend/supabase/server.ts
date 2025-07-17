import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config } from "../../shared/config/ConfigService";

export const createClient = async () => {
  const cookieStore = cookies();
  const dbConfig = config.getDatabaseConfig();

  return createServerClient(
    dbConfig.url,
    dbConfig.key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
};
