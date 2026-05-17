import { Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Dumbbell } from 'lucide-react';
import useFetch from "@/hooks/use-fetch";
import { logout } from "@/db/auth";
import { AuthState } from "@/context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = AuthState();
  const { fn: logoutFn } = useFetch(logout);

  const isLoggedIn = !!user;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Detect current view from URL
  const currentView = location.pathname.replace("/", "") || "landing";

  const navigateTo = (view) => {
    navigate(view === "landing" ? "/" : `/${view}`);
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutFn();
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navItems = [
    { label: "Explore", view: "/" },
    { label: "Stats", view: "dashboard" },
    { label: "Ideas", view: "ideas" },
    { label: "Arena", view: "pitch" },
    { label: "Plans", view: "pricing" },
    { label: "History", view: "history" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass-morphism backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] bg-black/40  ring-white/10  rounded-2xl px-4 py-2.5 flex justify-between items-center shadow-2xl border-white/5 relative">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-all">
            <Dumbbell size={20} color="white" />

          </div>
          <span className="text-xs md:text-sm font-black tracking-tighter text-white uppercase flex flex-col leading-none">
            <span>Pitch</span>
            <span className="text-indigo-500">Gym</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] rounded-xl p-1 border border-white/5">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                currentView === item.view
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Auth Section */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10 hover:border-indigo-500/50 transition-all"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 glass-morphism rounded-2xl p-2 border border-white/10 shadow-2xl z-[60]">
                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Add Credits
                  </button>

                  <div className="h-px bg-white/5 my-1" />

                  <button
                    onClick={() => navigate("/analytics")}
                    className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Founder Analysis
                  </button>

                  <div className="h-px bg-white/5 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="btn-primary px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest uppercase"
            >
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 md:hidden glass-morphism rounded-2xl p-4 border border-white/10 flex flex-col gap-2 z-[50]">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => navigateTo(item.view)}
                className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest ${
                  currentView === item.view
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "text-zinc-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
