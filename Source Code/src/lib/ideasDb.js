import supabase from "@/db/supabase";

export async function fetchUserIdeas(userId) {
  const { data, error } = await supabase
    .from("ideas")
    .select("*, user_pitches(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function createIdea(userId, name, description) {
  const { data, error } = await supabase
    .from("ideas")
    .insert({ user_id: userId, name: name.trim(), description: description?.trim() || null })
    .select()
    .single();
  return { data, error };
}

export async function updateIdea(id, name, description) {
  const { data, error } = await supabase
    .from("ideas")
    .update({ name: name.trim(), description: description?.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteIdea(id) {
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  return { error };
}
