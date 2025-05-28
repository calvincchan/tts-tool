"use client";

import { supabaseBrowserClient } from "@/utils/supabase/client";
import { dataProvider as dataProviderSupabase } from "@refinedev/supabase";

export const dataProvider = dataProviderSupabase(supabaseBrowserClient);
