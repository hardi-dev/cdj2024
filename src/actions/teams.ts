import { supabaseServerClient } from "@/lib/supabase/server";

export const getTeams = async () => {
  const supabase = supabaseServerClient();
  return (await supabase)
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });
}