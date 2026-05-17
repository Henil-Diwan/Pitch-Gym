import React from 'react'



const testimonials = [
              {
                 name: "Marcus Thorne",
                 role: "CEO, Solara (Series A)",
                 text: "The AI was more skeptical than my lead investor at Sequoia. It forced me to refine my TAM explanation until it was bulletproof."
               },
               {
                 name: "Elena Rodriguez",
                 role: "Founder, GreenFlow (YC W24)",
                 text: "Being able to practice voice-to-voice at 3 AM before our demo day was the single biggest factor in our successful raise."
               }
];


const LandingPage = () => {
  return (
     <div className="relative overflow-hidden pt-24 isolate">
        
        <div className="fixed inset-0 -z-10 pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
         
         
         
          {/* <Aurora
  colorStops={[
    "#020617", // almost-black base (keeps contrast)
    "#312e81", // deep indigo (authority)
    "#6366f1", // controlled accent indigo
    "#22d3ee"  // VERY subtle cyan highlight
  ]}
  blend={0.18}
  amplitude={0.45}
  speed={0.25}
/> */}


 </div>
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-morphism text-[10px] font-black tracking-[0.25em] uppercase mb-8 border border-white/10 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI Shark Tank Simulation
        </div>

        <h1 className="text-6xl md:text-[6.5rem] font-black tracking-[-0.04em] mb-8 max-w-5xl leading-[0.9] uppercase">
          <span className="block text-white opacity-90">Are you</span>
          <span className="block text-gradient">Funding Ready?</span>
        </h1>

        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-medium">
         Pitch to an AI that interrupts, challenges, and questions you like a Shark Tank judge.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mb-16">
          <button 
           
            className="btn-primary px-10 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 group"
          >
            Start Simulation
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <button 
           
            className="glass-morphism text-white px-10 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase border border-white/5 hover:bg-white/5 transition-all"
          >
            View Pricing
          </button>
        </div>

        {/* Realistic Hero Icons */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
           {[
             { label: 'Secure Protocol', icon: (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             )},
             { label: 'Live Synthesis', icon: (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
             )},
             { label: 'Neural Compute', icon: (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6" rx="1"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>
             )},
             { label: 'Low Latency', icon: (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
             )}
           ].map((item, i) => (
             <div key={i} className="flex flex-col items-center gap-3">
               <div className="text-zinc-400">{item.icon}</div>
               <span className="mono text-[8px] uppercase tracking-[0.3em] font-black">{item.label}</span>
             </div>
           ))}
        </div>
      </section>

      {/* Built for the Board Room Section */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h4 className="mono text-indigo-500 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Core Engine</h4>
            <h2  className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[1]">Built for the <br/>Board Room.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-morphism p-10 rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-8 shadow-xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 className="text-lg font-black mb-4 uppercase tracking-wider">Unflinching Realism</h3>
              <p className="text-zinc-500 leading-relaxed text-sm font-medium">The AI identifies hesitation patterns and challenges your assumptions on unit economics just like a GP would.</p>
            </div>
            <div className="glass-morphism p-10 rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-8 shadow-xl text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <h3 className="text-lg font-black mb-4 uppercase tracking-wider">Adversarial Logic</h3>
              <p className="text-zinc-500 leading-relaxed text-sm font-medium">Our simulation logic purposefully interrupts rambling. Learn to pivot and address objections with surgical precision.</p>
            </div>
            <div className="glass-morphism p-10 rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-8 shadow-xl text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h3 className="text-lg font-black mb-4 uppercase tracking-wider">Data-First Scoring</h3>
              <p className="text-zinc-500 leading-relaxed text-sm font-medium">Get ranked across 12 critical investability metrics. Know exactly why you'd get a term sheet or a rejection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Founders Say Section */}
      <section className="px-6 py-20 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h4 className="mono text-indigo-500 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Testimonials</h4>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[1]">What founders say <br/>about Pitch Gym.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {testimonials.map((t, i) => (
               <div key={i} className="glass-morphism p-10 rounded-[3rem] border-white/5 hover:bg-white/[0.02] transition-all">
                  <div className="text-indigo-500 mb-6 flex gap-1">
                    {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>)}
                  </div>
                  <p className="text-lg font-bold text-zinc-300 mb-8 leading-snug italic">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-xs text-indigo-500 uppercase">{t.name[0]}</div>
                     <div>
                        <h5 className="font-black text-[11px] uppercase tracking-widest">{t.name}</h5>
                        <p className="text-[9px] text-zinc-600 mono uppercase tracking-widest">{t.role}</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto glass-morphism rounded-[3rem] p-16 md:p-24 text-center border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />
          <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight uppercase leading-[1]">Lock in your <br/><span className="text-gradient">Seed Round.</span></h2>
          <button 
            
            className="btn-primary px-12 py-6 rounded-2xl font-black text-sm tracking-[0.25em] uppercase shadow-2xl"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
