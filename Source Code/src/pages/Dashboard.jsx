import React, { useState, useEffect } from "react";
import Spinner from "@/components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import { AuthState } from "@/context/authcontext";
import supabase from "@/db/supabase";
import { getAverageScore } from "@/lib/pitchAnalytics";
import { getAssessmentObject } from "@/lib/pitchParser";

function extractFeedback(structured) {
  const assessment = getAssessmentObject(structured);
  if (!assessment) return null;
  const first = Object.values(assessment).find((v) => v?.analysis);
  return first?.analysis || null;
}

export default function Dashboard() {
  const { user, loading: authLoading } = AuthState();
  const navigate = useNavigate();

  const [credits, setCredits] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [creditsRes, pitchesRes] = await Promise.all([
          supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("user_pitches")
            .select("id, pitch_structured_output, duration_seconds, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        if (cancelled) return;

        if (creditsRes.error && creditsRes.error.code !== "PGRST116") {
          setError("Failed to load credits.");
        }
        setCredits(creditsRes.data?.credits ?? 0);

        if (pitchesRes.error) {
          setError("Failed to load sessions.");
          return;
        }

        const mapped = (pitchesRes.data || []).map((row) => ({
          id: row.id,
          date: new Date(row.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          duration: `${Math.round((row.duration_seconds || 0) / 60)} min`,
          feedback: extractFeedback(row.pitch_structured_output) || "No feedback available.",
          score: getAverageScore(row.pitch_structured_output),
        }));
        setSessions(mapped);
      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard load failed:", err);
          setError("Something went wrong loading your dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id, authLoading]);

  const setView = () => {
    console.log("View change triggered");
  };

  function handleLaunch() {
    navigate('/pitch');
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-16 px-4 md:px-12 view-transition space-y-8 md:space-y-12">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-white/10 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm inline-flex items-center">
            <i className="fa-solid fa-user-circle mr-2 opacity-50 text-pitch-cyan"></i>
            {user?.email || "—"}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-brand font-extrabold text-white tracking-tighter leading-[0.9]">
              Your <span className="text-pitch-cyan">Growth.</span>
            </h1>
            <p className="text-slate-400 font-light text-base md:text-xl leading-relaxed">
              Step back into the studio. Alex is ready to hear your updated narrative and help you find that moment of pure clarity.
            </p>
          </div>
          
          {/* Mobile Credits */}
          <div className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Minutes Left
            </span>
            <span className="text-lg font-brand font-black text-pitch-yellow ml-auto">
              {credits ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pitch Now Card */}
        <div
          className="lg:col-span-2 relative group cursor-pointer"
          onClick={setView}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pitch-cyan/20 to-transparent rounded-[2.5rem] md:rounded-[3rem] blur-2xl opacity-50"></div>
          
          <div className="relative h-full p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] bg-slate-900/60 border border-white/10 glass-card flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pitch-cyan/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-pitch-cyan border border-pitch-cyan/20 mb-2">
                <i className="fa-solid fa-bolt-lightning"></i>
                Ready for session
              </div>
              <h2 className="text-3xl md:text-5xl font-brand font-bold text-white tracking-tight">
                Pitch Now.
              </h2>
              <p className="text-slate-400 font-light text-sm md:text-lg max-w-sm">
                Open the practice studio to start a live audio session with your coach.
              </p>
            </div>
            
            <div className="shrink-0 flex flex-col items-center gap-4" >
              <div onClick={handleLaunch} className="w-20 h-20 md:w-24 md:h-24 bg-pitch-cyan text-pitch-navy rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-[0_0_40px_rgba(56,189,248,0.3)]">
                <i className="fa-solid fa-play ml-1"></i>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-pitch-cyan opacity-60" >
                Launch Studio
              </span>
            </div>
          </div>
        </div>

        {/* Credits Card */}
        <div className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-slate-900/40 border border-white/5 glass-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Minutes Left
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl md:text-7xl font-brand font-extrabold text-white tracking-tighter">
                {credits != null ? Number(credits).toFixed(1) : "0.0"}
              </h2>
              <span className="text-slate-600 font-bold text-xs uppercase tracking-widest">
                min
              </span>
            </div>
          </div>
          
          <div className="space-y-4 mt-8">
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Running low? Get more minutes to keep practicing your pitch.
            </p>
            <button
              onClick={setView}
              className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Get More Credits
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl md:text-3xl font-brand font-bold text-white tracking-tight">
            Previous Reps
          </h3>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            {sessions.length} Sessions recorded
          </span>
        </div>

        <div className="bg-slate-900/60 rounded-[2rem] border border-white/5 overflow-hidden shadow-xl divide-y divide-white/5">
          {sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm">No sessions yet. Launch the studio to get started.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="p-5 md:p-8 flex flex-col sm:flex-row gap-6 justify-between"
              >
                <div>
                  <p className="text-white font-bold text-lg">{session.date}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {session.duration} • ID #{String(session.id ?? "").slice(-4)}
                  </p>
                </div>

                <p className="text-slate-400 text-sm italic max-w-xl">
                  {"\u201C"}{session.feedback}{"\u201D"}
                </p>

                <div className="text-right">
                  <p className="text-3xl font-brand font-black text-white">
                    {session.score ?? "—"}
                    <span className="text-slate-600 text-xs"> /5</span>
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-600">
                    Confidence
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insight Section */}
      <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border border-white/5 glass-card flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="space-y-4 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-pitch-yellow font-bold text-[10px] uppercase tracking-[0.4em]">
            <i className="fa-solid fa-lightbulb"></i>
            Weekly Insight
          </div>
          <h3 className="text-3xl md:text-5xl font-brand font-bold">
            The "Alex" Advantage
          </h3>
          <p className="text-slate-400 text-base md:text-xl font-light">
            Your AI coach Alex is currently focused on emotional clarity and founder-market fit.
          </p>
        </div>

        <button
          onClick={setView}
          className="bg-white text-black px-12 py-5 rounded-2xl font-brand font-black text-xl btn-human"
        >
          Try Insight Mode
        </button>
      </div>
    </div>
  );
}
