export function SectionCard({ title, accent, children }) {
  return (
    <div className="bg-[#07132b] border border-white/8 rounded-[2rem] p-8">
      <h2 className="text-xl font-brand font-bold text-white mb-6 flex items-center gap-3">
        {accent && <span style={{ width: 4, height: 20, borderRadius: 99, background: accent, display: "inline-block", flexShrink: 0 }} />}
        {title}
      </h2>
      {children}
    </div>
  );
}