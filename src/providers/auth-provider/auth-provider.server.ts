import { createSupabaseServerClient } from "@/utils/supabase/server";
import type { AuthProvider } from "@refinedev/core";

export const authProviderServer: Pick<AuthProvider, "check"> = {
  check: async () => {
    const { data, error } = await createSupabaseServerClient().auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
};
