import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { Plus, Pencil, Trash2, Lightbulb, X, Check } from "lucide-react";
import useIdeas from "@/hooks/useIdeas";

/* ── Inline modal for create / edit ── */
function IdeaFormModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setErr("Name is required."); return; }
    setSaving(true);
    const result = await onSave(name, description);
    setSaving(false);
    if (result?.error) { setErr(result.error); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#0a1628] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-black text-xl">
            {initial ? "Edit Idea" : "New Idea"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
              Idea Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI-powered hiring tool"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your startup idea..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          {err && <p className="text-red-400 text-sm">{err}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-black text-sm text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Single idea card ── */
function IdeaCard({ idea, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pitchCount = idea.user_pitches?.[0]?.count ?? 0;

  return (
    <div className="bg-[#07132b] border border-white/8 hover:border-white/15 transition rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Lightbulb size={18} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-black text-lg leading-tight truncate">{idea.name}</h3>
            <span className="text-xs text-zinc-600 mt-0.5 block">
              {pitchCount} pitch{pitchCount !== 1 ? "es" : ""}
            </span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(idea)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition"
          >
            <Pencil size={14} />
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(idea.id)}
                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-zinc-500 hover:text-red-400 transition"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {idea.description && (
        <p className="text-zinc-500 text-sm leading-relaxed">{idea.description}</p>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function IdeaBank() {
  const { ideas, loading, loadIdeas, addIdea, editIdea, removeIdea } = useIdeas();
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);

  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  function handleEdit(idea) {
    setEditingIdea(idea);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingIdea(null);
  }

  async function handleSave(name, description) {
    if (editingIdea) {
      return editIdea(editingIdea.id, name, description);
    }
    return addIdea(name, description);
  }

  return (
    <>
      {showForm && (
        <IdeaFormModal
          initial={editingIdea}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}

      <div className="max-w-4xl mx-auto pt-32 px-6 pb-16 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Idea Bank
            </h1>
            <p className="text-zinc-500 mt-2">
              Organise your startup ideas and track progress per idea.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition font-black text-sm text-white"
          >
            <Plus size={16} />
            New Idea
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner label="Loading ideas" />
        ) : ideas.length === 0 ? (
          <div className="bg-[#07132b] border border-white/8 rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <Lightbulb size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-white font-black text-lg">No ideas yet</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              Create your first idea to start tracking analytics per startup concept.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition font-black text-sm text-white mt-2"
            >
              <Plus size={16} />
              Create Idea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onEdit={handleEdit}
                onDelete={removeIdea}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
