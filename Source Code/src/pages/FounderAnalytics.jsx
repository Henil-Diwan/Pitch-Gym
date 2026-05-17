import { useEffect, useState, useMemo } from "react";
import supabase from "@/db/supabase";
import useIdeas from "@/hooks/useIdeas";

import {
  getFounderReadiness,
  buildImprovementData,
  buildSkillRadar,
  buildPitchTypeStats
} from "@/lib/founderAnalytics";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

/* ─────────────────────────────────────
   Dark Tooltip
───────────────────────────────────── */

const DarkTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: "#0f172a",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
    }}>
      <p style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
        {data.skill ? "Skill" : "Session"}
      </p>
      <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
        {data.skill || `Session ${data.session}`}
      </p>
      <p style={{ color: "#22d3ee", fontSize: 13, marginTop: 4 }}>
        Score: {(data.score ?? payload[0].value)?.toFixed(2)} / 5
      </p>
    </div>
  );
};

const LineTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: "#0f172a",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
    }}>
      <p style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Session</p>
      <p style={{ color: "#22d3ee", fontWeight: 700, fontSize: 15 }}>{payload[0].value?.toFixed(2)} / 5</p>
    </div>
  );
};

/* ─────────────────────────────────────
   Stat Card
───────────────────────────────────── */
const StatCard = ({ label, value, sub, accent = "#22d3ee" }) => (
  <div style={{
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "28px 32px",
  }}>
    <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>{label}</p>
    <p style={{ color: accent, fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginTop: 8 }}>{value}</p>
    {sub && <p style={{ color: "#475569", fontSize: 13, marginTop: 8 }}>{sub}</p>}
  </div>
);

/* ─────────────────────────────────────
   Chart Card wrapper
───────────────────────────────────── */
const ChartCard = ({ title, children, style = {} }) => (
  <div style={{
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "36px 40px",
    ...style
  }}>
    <h2 style={{
      color: "#fff",
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "-0.3px",
      marginBottom: 32,
    }}>
      {title}
    </h2>
    {children}
  </div>
);

/* ─────────────────────────────────────
   Custom Radar Tick — wraps long labels
───────────────────────────────────── */
const RadarTick = ({ payload, x, y, textAnchor, cx, cy }) => {
  const label = payload.value;
  const words = label.split(" ");
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");

  // Push tick outward from center
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const pad = 18;
  const nx = x + (dx / dist) * pad;
  const ny = y + (dy / dist) * pad;

  return (
    <text x={nx} y={ny} textAnchor={textAnchor} dominantBaseline="central" fill="#94a3b8" fontSize={12} fontWeight={500}>
      <tspan x={nx} dy={words.length > 1 ? "-0.6em" : "0"}>{line1}</tspan>
      {words.length > 1 && <tspan x={nx} dy="1.3em">{line2}</tspan>}
    </text>
  );
};

/* ─────────────────────────────────────
   Main Component
───────────────────────────────────── */
export default function FounderAnalytics() {
  const [pitches, setPitches] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("all");

  const { ideas, loadIdeas } = useIdeas();

  useEffect(() => { load(); loadIdeas(); }, [loadIdeas]);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("user_pitches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) { console.error(error); return; }
    setPitches(data || []);
  }

  const filteredPitches = useMemo(() => {
    if (selectedIdeaId === "all") return pitches;
    if (selectedIdeaId === "none") return pitches.filter((p) => !p.idea_id);
    return pitches.filter((p) => p.idea_id === selectedIdeaId);
  }, [pitches, selectedIdeaId]);

  const readiness     = useMemo(() => getFounderReadiness(filteredPitches),   [filteredPitches]);
  const improvement   = useMemo(() => buildImprovementData(filteredPitches),  [filteredPitches]);
  const radar         = useMemo(() => buildSkillRadar(filteredPitches),       [filteredPitches]);
  const pitchTypeStats= useMemo(() => buildPitchTypeStats(filteredPitches),   [filteredPitches]);

  const insights = useMemo(() => {
    if (!radar.length) return null;
    const sorted = [...radar].sort((a, b) => b.score - a.score);
    return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
  }, [radar]);

  const activeIdeaName = useMemo(() => {
    if (selectedIdeaId === "all") return null;
    if (selectedIdeaId === "none") return "Unassociated";
    return ideas.find((i) => i.id === selectedIdeaId)?.name || null;
  }, [selectedIdeaId, ideas]);

  return (
    <div className="max-w-[1200px] mx-auto pt-28 md:pt-[120px] px-4 md:px-8 pb-20 flex flex-col gap-8 md:gap-12">

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Founder Analytics
          {activeIdeaName && (
            <span className="text-[#22d3ee] text-2xl md:text-[32px] font-bold ml-2 md:ml-4">
              — {activeIdeaName}
            </span>
          )}
        </h1>
        <p className="text-slate-500 mt-3 text-sm md:text-base">
          Track how your pitching skills improve across AI sessions.
        </p>
      </div>

      {/* ── IDEA FILTER ── */}
      {ideas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Ideas" },
            { id: "none", label: "Unassociated" },
            ...ideas.map((i) => ({ id: i.id, label: i.name })),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedIdeaId(item.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 99,
                border: `1px solid ${selectedIdeaId === item.id ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.08)"}`,
                background: selectedIdeaId === item.id ? "rgba(34,211,238,0.08)" : "transparent",
                color: selectedIdeaId === item.id ? "#22d3ee" : "#64748b",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* ── READINESS SCORE + STATS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Big readiness block */}
        <div style={{
          background: "#0f172a",
          border: "1px solid rgba(34,211,238,0.2)",
          borderRadius: 24,
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>
            Founder Readiness Score
          </p>
          <p style={{ color: "#22d3ee", fontSize: 80, fontWeight: 900, lineHeight: 1, marginTop: 16 }}>
            {readiness}
          </p>
          <div>
            <div style={{ width: "100%", background: "rgba(255,255,255,0.08)", height: 8, borderRadius: 99, marginTop: 20 }}>
              <div style={{ background: "#22d3ee", height: 8, borderRadius: 99, width: `${readiness}%`, transition: "width 1s ease" }} />
            </div>
            <p style={{ color: "#475569", fontSize: 13, marginTop: 10 }}>out of 100</p>
          </div>
        </div>

        {/* Pitch sessions */}
        <StatCard
          label="Total Sessions"
          value={filteredPitches.length}
          sub={activeIdeaName ? `for "${activeIdeaName}"` : "AI pitch analysis sessions"}
        />

        {/* Avg score */}
        <StatCard
          label="Average Score"
          value={improvement.length
            ? (improvement.reduce((s, d) => s + d.score, 0) / improvement.length).toFixed(1)
            : "—"}
          sub={activeIdeaName ? `for "${activeIdeaName}"` : "across all sessions"}
        />
      </div>

      {/* ── IMPROVEMENT OVER TIME (full width) ── */}
      <ChartCard title="Improvement Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={improvement} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <XAxis
              dataKey="session"
              stroke="#334155"
              tick={{ fill: "#64748b", fontSize: 13 }}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              label={{ value: "Session", position: "insideBottom", offset: -4, fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 5]}
              stroke="#334155"
              tick={{ fill: "#64748b", fontSize: 13 }}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip content={<LineTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ r: 6, fill: "#22d3ee", stroke: "#0f172a", strokeWidth: 3 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── RADAR + PITCH TYPE SIDE BY SIDE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SKILL RADAR */}
        <ChartCard title="Skill Radar">
          <ResponsiveContainer width="100%" height={420}>
            <RadarChart
              data={radar}
              outerRadius="55%"
              margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
            >
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: "#475569", fontSize: 11 }}
                tickCount={4}
                stroke="transparent"
              />
              <PolarAngleAxis
                dataKey="skill"
                tick={<RadarTick />}
              />
              <Tooltip content={<DarkTooltip />} />
              <Radar
                dataKey="score"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.25}
                strokeWidth={2.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PITCH TYPE PERFORMANCE */}
        <ChartCard title="Pitch Type Performance">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={pitchTypeStats}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                stroke="#334155"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
              />
              <YAxis
                type="category"
                dataKey="type"
                stroke="#334155"
                tick={{ fill: "#94a3b8", fontSize: 13 }}
                tickLine={false}
                axisLine={false}
                width={130}
              />
              <Tooltip content={<LineTooltip />} />
              <Bar
                dataKey="score"
                fill="#22d3ee"
                radius={[0, 6, 6, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* ── AI INSIGHTS ── */}
      {insights && (
        <div style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: "40px 48px",
        }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 36 }}>
            AI Founder Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

            <div style={{
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.15)",
              borderRadius: 16,
              padding: "24px 28px",
            }}>
              <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>
                Strongest Skill
              </p>
              <p style={{ color: "#22d3ee", fontSize: 26, fontWeight: 800, marginTop: 10, letterSpacing: "-0.4px" }}>
                {insights.strongest.skill}
              </p>
              <p style={{ color: "#475569", fontSize: 14, marginTop: 8 }}>
                Score {insights.strongest.score.toFixed(2)} / 5
              </p>
            </div>

            <div style={{
              background: "rgba(248,113,113,0.06)",
              border: "1px solid rgba(248,113,113,0.15)",
              borderRadius: 16,
              padding: "24px 28px",
            }}>
              <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>
                Needs Improvement
              </p>
              <p style={{ color: "#f87171", fontSize: 26, fontWeight: 800, marginTop: 10, letterSpacing: "-0.4px" }}>
                {insights.weakest.skill}
              </p>
              <p style={{ color: "#475569", fontSize: 14, marginTop: 8 }}>
                Score {insights.weakest.score.toFixed(2)} / 5
              </p>
            </div>

          </div>

          <p style={{
            color: "#64748b",
            fontSize: 15,
            marginTop: 32,
            lineHeight: 1.7,
            maxWidth: 680,
          }}>
            Focusing on <span style={{ color: "#fff", fontWeight: 600 }}>{insights.weakest.skill}</span> will
            significantly increase your overall pitch performance and improve investor confidence.
          </p>
        </div>
      )}

    </div>
  );
}