import { useState, useCallback } from "react";
import supabase from "@/db/supabase";
import { fetchUserIdeas, createIdea, updateIdea, deleteIdea } from "@/lib/ideasDb";

export default function useIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error: fetchError } = await fetchUserIdeas(user.id);
      if (fetchError) throw fetchError;
      setIdeas(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addIdea = useCallback(async (name, description) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await createIdea(user.id, name, description);
    if (error) return { error: error.message };
    setIdeas((prev) => [data, ...prev]);
    return { data };
  }, []);

  const editIdea = useCallback(async (id, name, description) => {
    const { data, error } = await updateIdea(id, name, description);
    if (error) return { error: error.message };
    setIdeas((prev) => prev.map((i) => (i.id === id ? data : i)));
    return { data };
  }, []);

  const removeIdea = useCallback(async (id) => {
    const { error } = await deleteIdea(id);
    if (error) return { error: error.message };
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    return {};
  }, []);

  return { ideas, loading, error, loadIdeas, addIdea, editIdea, removeIdea };
}
