import { createBrowserClient } from "@supabase/ssr";
import { config } from "@optimacx/shared/config/ConfigService";

export const createClient = () => {
  const dbConfig = config.getDatabaseConfig();
  return createBrowserClient(
    dbConfig.url,
    dbConfig.key
  );
};
