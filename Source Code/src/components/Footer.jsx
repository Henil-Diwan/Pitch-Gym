import React from 'react'

const Footer = () => {
  return (
      <footer className="py-16 px-6 border-t border-white/5 bg-[#01040a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-shield-heart text-pitch-cyan text-xs"></i>
              </div>
              <span className="font-brand text-xl font-extrabold text-white tracking-tighter">PITCHGYM</span>
            </div>
            <p className="text-slate-500 max-w-sm text-sm font-light leading-relaxed">
              We provide the psychological safety and technological precision founders need to master the art of the investor pitch.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Platform</h4>
              <ul className="space-y-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <li><button onClick={() => setView(View.ARENA)} className="hover:text-pitch-cyan transition">Practice Arena</button></li>
                <li><button onClick={() => setView(View.DASHBOARD)} className="hover:text-pitch-cyan transition">Dashboard</button></li>
                <li><button onClick={() => setView(View.PRICING)} className="hover:text-pitch-cyan transition">Pricing</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <li><a href="#" className="hover:text-pitch-cyan transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-pitch-cyan transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-pitch-cyan transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">© 2024 PITCH GYM LABS</p>
           <div className="flex gap-6 text-slate-600">
             <i className="fa-brands fa-x-twitter hover:text-white cursor-pointer transition"></i>
             <i className="fa-brands fa-linkedin hover:text-white cursor-pointer transition"></i>
             <i className="fa-brands fa-github hover:text-white cursor-pointer transition"></i>
           </div>
        </div>
      </footer>
  )
}

export default Footer
