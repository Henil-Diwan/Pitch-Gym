import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import supabase from "@/db/supabase";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Lightbulb,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import useIdeas from "@/hooks/useIdeas";
import { fetchPreviousPitches, buildSinglePitchContext } from "@/lib/pitchContext";

/* ---------------- CONSTANTS ---------------- */

const pitchTypes = [
  {
    id: 1,
    label: "Idea Validation",
    description: "Test if your problem is real and worth solving before building anything.",
    skills: ["Problem Clarity", "Customer Definition", "Evidence", "Communication"],
  },
  {
    id: 2,
    label: "Elevator Pitch",
    description: "Deliver a crisp, compelling 60-second pitch that sticks.",
    skills: ["Clarity", "Memorability", "Market Framing", "Confidence"],
    maxMinutes: 3,
  },
  {
    id: 3,
    label: "VC Ready",
    description: "Full investor-style session covering all pillars of a fundable startup.",
    skills: ["Business Model", "Traction", "Go-to-Market", "Pressure Handling"],
  },
  {
    id: 4,
    label: "Product Feedback",
    description: "Get sharp product critique from an investor's lens.",
    skills: ["Product Clarity", "Differentiation", "UX Quality", "Value Prop"],
  },
  {
    id: 5,
    label: "Customer Discovery",
    description: "Prove you deeply understand who you're building for and why.",
    skills: ["Customer Behavior", "Problem Context", "Insights", "Alternatives"],
  },
  {
    id: 6,
    label: "Technical Pitch",
    description: "Defend your architecture and technical decisions to a technical investor.",
    skills: ["Architecture", "Feasibility", "Scalability", "Technical Moat"],
  },
  {
    id: 7,
    label: "Demo Day",
    description: "Simulate a high-stakes Demo Day presentation under the spotlight.",
    skills: ["Storytelling", "Market Opportunity", "Traction", "Stage Presence"],
    maxMinutes: 10,
  },
  {
    id: 8,
    label: "Customer Pitch",
    description: "Pitch directly to a potential customer and win their buy-in.",
    skills: ["Problem Relevance", "Value Prop", "Workflow Fit", "Cost Justification"],
  },
  {
    id: 9,
    label: "Co-Founder Pitch",
    description: "Convince a potential co-founder to join your vision.",
    skills: ["Vision Clarity", "Role Alignment", "Commitment", "Persuasion"],
  },
  {
    id: 10,
    label: "Investor Skeptic Mode",
    description: "Face an aggressive skeptic who challenges every assumption.",
    skills: ["Pressure Handling", "Competition Defense", "Composure", "Realism"],
  },
];

const difficulties = [
  { id: 1, label: "Conservative" },
  { id: 2, label: "Balanced" },
  { id: 3, label: "Aggressive" },
];

export default function PitchDashboard() {

  const [step, setStep] = useState(1);

  const [pitchType, setPitchType] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

  const { ideas, loadIdeas } = useIdeas();

  /* ---------- CONTEXT CARRY-FORWARD ---------- */
  const [previousPitches, setPreviousPitches] = useState([]); // dropdown options
  const [selectedPrevPitchId, setSelectedPrevPitchId] = useState(null); // chosen pitch id
  const [contextLoading, setContextLoading] = useState(false);
  const [contextPreview, setContextPreview] = useState(null); // summary string

  const [isTalking, setIsTalking] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  /* ---------- TRANSCRIPT STATE ---------- */

  const [transcript, setTranscript] = useState([]);
  const transcriptEndRef = useRef(null);

  const vapiRef = useRef(null);

  /* ---------- CREDIT TIMER STATE ---------- */
  const [remainingCredits, setRemainingCredits] = useState(null); // minutes available
  const [secondsLeft, setSecondsLeft] = useState(null); // countdown in seconds
  const [timeWarning, setTimeWarning] = useState(null); // "2min" | "1min" | "ended"
  const timerRef = useRef(null);
  const warningShownRef = useRef({ twoMin: false, oneMin: false });

  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  // Fetch previous pitches when idea changes
  useEffect(() => {
    setSelectedPrevPitchId(null);
    setContextPreview(null);
    setPreviousPitches([]);

    if (!selectedIdeaId) return;

    let cancelled = false;
    (async () => {
      setContextLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !cancelled) {
          const list = await fetchPreviousPitches(session.user.id, selectedIdeaId);
          if (!cancelled) setPreviousPitches(list);
        }
      } finally {
        if (!cancelled) setContextLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedIdeaId]);

  // Build context preview when a previous pitch is selected
  const handlePrevPitchSelect = (pitchId) => {
    if (pitchId === "") {
      setSelectedPrevPitchId(null);
      setContextPreview(null);
      return;
    }
    const pitch = previousPitches.find((p) => p.id === pitchId);
    setSelectedPrevPitchId(pitchId);
    setContextPreview(pitch ? buildSinglePitchContext(pitch) : null);
  };

  /* ---------- FETCH CREDITS ---------- */
  const fetchCredits = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 0;
    const { data } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", session.user.id)
      .single();
    const mins = data?.credits ?? 0;
    setRemainingCredits(mins);
    return mins;
  }, []);

  // Fetch credits on mount and when returning to step 1
  useEffect(() => { fetchCredits(); }, [fetchCredits, step]);

  /* ---------- COUNTDOWN TIMER ---------- */
  useEffect(() => {
    if (!isTalking || secondsLeft === null) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Time's up — stop the call
          clearInterval(timerRef.current);
          setTimeWarning("ended");
          vapiRef.current?.stop();
          setIsTalking(false);
          setTranscript([]);
          setStep(1);
          return 0;
        }

        const next = prev - 1;

        // 2 minute warning
        if (next <= 120 && !warningShownRef.current.twoMin) {
          warningShownRef.current.twoMin = true;
          setTimeWarning("2min");
        }
        // 1 minute warning
        if (next <= 60 && !warningShownRef.current.oneMin) {
          warningShownRef.current.oneMin = true;
          setTimeWarning("1min");
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isTalking, secondsLeft]);

  // Auto-dismiss warning after 5 seconds (except "ended")
  useEffect(() => {
    if (!timeWarning || timeWarning === "ended") return;
    const t = setTimeout(() => setTimeWarning(null), 5000);
    return () => clearTimeout(t);
  }, [timeWarning]);

  const formatTime = (secs) => {
    if (secs == null) return "--:--";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  /* ------------------------------------------------ */
  /* INIT VAPI                                        */
  /* ------------------------------------------------ */

  useEffect(() => {

    if (step !== 2 && step !== 3) return;
    if (vapiRef.current) return;

    const vapi = new Vapi(
      "public-token",
      "https://ecgsefqppxkiometotyz.supabase.co/functions/v1/smooth-task"
    );

    vapiRef.current = vapi;

    /* ---------- LISTEN FOR TRANSCRIPTS ---------- */

    vapi.on("message", (message) => {

      if (message.type !== "transcript") return;

      const text = message.transcript;
      const role = message.role || "assistant";
      const type = message.transcriptType;

      if (!text) return;

      setTranscript((prev) => {

        const updated = [...prev];

        if (type === "partial") {

          if (
            updated.length &&
            updated[updated.length - 1].role === role &&
            updated[updated.length - 1].isPartial
          ) {

            updated[updated.length - 1].text = text;

          } else {

            updated.push({
              role,
              text,
              isPartial: true,
            });

          }

        }

        else if (type === "final") {

          if (
            updated.length &&
            updated[updated.length - 1].role === role &&
            updated[updated.length - 1].isPartial
          ) {

            updated[updated.length - 1] = {
              role,
              text,
              isPartial: false,
            };

          } else {

            updated.push({
              role,
              text,
              isPartial: false,
            });

          }

        }

        return updated;

      });

    });

  }, [step]);

  /* ---------- AUTO SCROLL ---------- */

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  /* ------------------------------------------------ */
  /* START CALL                                       */
  /* ------------------------------------------------ */

  const startTalking = async () => {

    try {

      setConnecting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("User not authenticated");
      if (!vapiRef.current) throw new Error("Vapi not initialized");

      const selectedPitch = pitchTypes.find(p => p.id === pitchType);

      await vapiRef.current.start({
        assistantType: pitchType,
        supabaseAccessToken: session.access_token,

        metadata: {
          userId: session.user.id,
          pitchType: selectedPitch?.label,
          ideaId: selectedIdeaId || null,
          previousContext: contextPreview || null,
        }
      });

      // Start countdown timer — use pitch cap if defined, else full credits
      const mins = await fetchCredits();
      const selectedPitchConfig = pitchTypes.find(p => p.id === pitchType);
      const cap = selectedPitchConfig?.maxMinutes;
      const effectiveMinutes = cap ? Math.min(mins, cap) : mins;
      setSecondsLeft(Math.round(effectiveMinutes * 60));
      warningShownRef.current = { twoMin: false, oneMin: false };
      setTimeWarning(null);

      setIsTalking(true);
      setStep(3);
      setConnecting(false);

    } catch (err) {

      console.error("Error starting Vapi:", err);
      setConnecting(false);

    }

  };

  /* ------------------------------------------------ */
  /* STOP CALL                                        */
  /* ------------------------------------------------ */

  const stopTalking = () => {

    clearInterval(timerRef.current);
    vapiRef.current?.stop();

    setIsTalking(false);
    setConnecting(false);
    setTranscript([]);
    setSecondsLeft(null);
    setTimeWarning(null);

    setStep(1);

  };

  /* ------------------------------------------------ */
  /* MIC TOGGLE                                       */
  /* ------------------------------------------------ */

  const toggleMic = () => {

    const next = !micOn;
    setMicOn(next);

    vapiRef.current?.setMuted(!next);

  };

  /* ===================================================== */
  /* STEP 1 — CONFIG                                       */
  /* ===================================================== */

  if (step === 1) {

    return (

      <div className="pt-32 px-6 max-w-5xl mx-auto space-y-10">

        <h1 className="text-3xl font-black text-white">
          Configure Pitch Session
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

          {pitchTypes.map((p) => (

            <button
              key={p.id}
              onClick={() => setPitchType(p.id)}
              className={`p-5 rounded-2xl border transition text-left flex flex-col gap-3 ${
                pitchType === p.id
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >

              <div className="font-black text-sm leading-snug">{p.label}</div>
              <div className="text-xs text-zinc-400 leading-relaxed">{p.description}</div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {p.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      pitchType === p.id
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </button>

          ))}

        </div>

        {/* ── IDEA SELECTOR ── */}
        {ideas.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
              Which idea are you pitching? <span className="text-zinc-600 font-normal normal-case tracking-normal">(optional)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedIdeaId(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition ${
                  selectedIdeaId === null
                    ? "border-zinc-500 bg-zinc-500/10 text-white"
                    : "border-white/10 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                No idea
              </button>
              {ideas.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => setSelectedIdeaId(idea.id === selectedIdeaId ? null : idea.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition ${
                    selectedIdeaId === idea.id
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Lightbulb size={13} />
                  {idea.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTINUE WITH CONTEXT ── */}
        {selectedIdeaId && (
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
              Continue from a previous session? <span className="text-zinc-600 font-normal normal-case tracking-normal">(optional)</span>
            </h2>

            {contextLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 size={14} className="animate-spin" />
                Loading sessions…
              </div>
            ) : previousPitches.length === 0 ? (
              <p className="text-xs text-zinc-600">No previous sessions for this idea yet.</p>
            ) : (
              <>
                <select
                  value={selectedPrevPitchId || ""}
                  onChange={(e) => handlePrevPitchSelect(e.target.value || "")}
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-[#0a0a0a] text-sm text-white cursor-pointer hover:border-white/20 transition focus:outline-none focus:border-indigo-500"
                >
                  <option value="" className="bg-[#1a1a1a] text-white">Start fresh (no context)</option>
                  {previousPitches.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#1a1a1a] text-white">
                      {p.pitchType} — {p.date} {p.time} — {p.rating || "Unrated"}{p.avgScore ? ` (${p.avgScore}/5)` : ""}
                    </option>
                  ))}
                </select>

                {contextPreview && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {contextPreview}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setStep(2)}
          className="w-full mb-3 py-6 rounded-3xl bg-indigo-600 font-black tracking-widest uppercase hover:bg-indigo-500 transition"
        >
          Initialize Meeting
        </button>

      </div>

    );
  }

  /* ===================================================== */
  /* STEP 2 — READY SCREEN                                 */
  /* ===================================================== */

  if (step === 2) {

    return (

      <div className="h-screen flex items-center justify-center bg-black text-white">

        <div className="bg-white/5 p-12 rounded-3xl text-center space-y-6">

          <h2 className="text-2xl font-black">
            Ready to Join
          </h2>

          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <Clock size={16} />
            <span>
              {remainingCredits != null
                ? (() => {
                    const cap = pitchTypes.find(p => p.id === pitchType)?.maxMinutes;
                    const effective = cap ? Math.min(remainingCredits, cap) : remainingCredits;
                    const label = `${Number(effective).toFixed(1)} minute${effective === 1 ? "" : "s"}`;
                    return cap && remainingCredits > cap
                      ? `${label} (${cap}-min session cap)`
                      : `${label} available`;
                  })()
                : "Loading…"}
            </span>
          </div>

          {remainingCredits != null && remainingCredits <= 0 ? (
            <div className="space-y-3">
              <p className="text-red-400 text-sm font-medium">
                You have no minutes left. Purchase more credits to continue.
              </p>
              <button
                onClick={() => setStep(1)}
                className="px-8 py-3 rounded-full bg-white/10 font-medium hover:bg-white/15 transition text-sm"
              >
                Go Back
              </button>
            </div>
          ) : (
            <button
              onClick={startTalking}
              disabled={connecting || remainingCredits == null}
              className="px-10 py-4 rounded-full bg-[#1a73e8] font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? "Joining…" : "Join Now"}
            </button>
          )}

        </div>

      </div>

    );
  }



  return (

    

    <div className="fixed inset-0 bg-[#202124] text-white flex flex-col md:flex-row">


<div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[40vh] md:min-h-0">

  {/* Animated orb */}
  <div className="relative flex items-center justify-center">

    {isTalking && (
      <>
        <div className="absolute w-56 h-56 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute w-44 h-44 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.3s" }} />
      </>
    )}

    {/* Core orb */}
    <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
      isTalking
        ? "bg-gradient-to-br from-cyan-400/20 to-blue-600/20 shadow-[0_0_60px_rgba(34,211,238,0.25)]"
        : "bg-white/5"
    }`}>

      {/* Wave bars */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-cyan-400"
            style={{
              height: isTalking ? undefined : "8px",
              animation: isTalking ? "vapiWave 1.2s ease-in-out infinite" : "none",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

    </div>
  </div>

  <div className="text-center space-y-1">
    <p className="text-white font-semibold text-lg">Alex</p>
    <p className="text-slate-500 text-sm">{isTalking ? "Speaking…" : "Listening…"}</p>
  </div>

</div>

      {/* ---------- TRANSCRIPT PANEL ---------- */}

      <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-white/10 flex flex-col max-h-[40vh] md:max-h-none">

        <div className="p-4 font-semibold border-b border-white/10">
          Live Transcript
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {transcript.map((line, index) => {

            const isInvestor = line.role === "assistant";

            return (

              <div
                key={index}
                className={`flex ${
                  isInvestor ? "justify-start" : "justify-end"
                }`}
              >

                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    line.isPartial
                      ? "bg-white/5 italic text-zinc-400"
                      : isInvestor
                      ? "bg-white/10 text-white"
                      : "bg-indigo-600 text-white"
                  }`}
                >

                  {line.text}

                </div>

              </div>

            );
          })}

          <div ref={transcriptEndRef} />

        </div>

      </div>

      {/* ---------- TIME WARNING BANNER ---------- */}
      {timeWarning && timeWarning !== "ended" && (
        <div className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-center gap-2 py-3 text-sm font-bold animate-pulse ${
          timeWarning === "1min"
            ? "bg-red-600/90 text-white"
            : "bg-amber-500/90 text-black"
        }`}>
          <AlertTriangle size={16} />
          {timeWarning === "2min" ? "2 minutes remaining" : "1 minute remaining — wrap up!"}
        </div>
      )}

      {/* ---------- CONTROLS ---------- */}

      <div className="fixed md:absolute bottom-0 left-0 right-0 h-[80px] md:h-[96px] flex items-center justify-center gap-4 md:gap-6 bg-[#202124] z-20">

        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            micOn ? "bg-[#3c4043]" : "bg-red-600"
          }`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={() => setCamOn(!camOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            camOn ? "bg-[#3c4043]" : "bg-red-600"
          }`}
        >
          {camOn ? <Video /> : <VideoOff />}
        </button>

        <button
          onClick={stopTalking}
          className="w-14 h-14 rounded-full bg-[#ea4335] flex items-center justify-center"
        >
          <PhoneOff />
        </button>

        {/* Timer display */}
        {secondsLeft != null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono font-bold ${
            secondsLeft <= 60
              ? "bg-red-600/20 text-red-400"
              : secondsLeft <= 120
              ? "bg-amber-500/20 text-amber-400"
              : "bg-white/10 text-white"
          }`}>
            <Clock size={14} />
            {formatTime(secondsLeft)}
          </div>
        )}

      </div>
        <style>{`
  @keyframes vapiWave {
    0%, 100% { height: 8px; }
    50% { height: 40px; }
  }
`}</style>
    </div>
  );
}