import React, { useEffect, useState } from "react";
import { LoginApi, signup, loginWithGoogle, sendResetPasswordEmail } from "@/db/auth"
import { AuthState } from "@/context/authcontext.jsx"
import useFetch from "@/hooks/use-fetch"
import { useNavigate } from "react-router-dom"


const Auth = ({ onAuthSuccess }) => {

  const [authMode, setAuthMode] = useState("signin"); // signin | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const [name, setName] = useState("");

  const [resetSent, setResetSent] = useState(false);

  const { loading, error, fn: loginFn } = useFetch(LoginApi)

  const {
    data,
    loading: signupLoading,
    error: signupError,
    fn: signupFn,
  } = useFetch(signup)
  const {isLoading,isAuthenticated} = AuthState()
  const navigate = useNavigate();
  useEffect(() => {
  if (!isLoading && isAuthenticated) {
    navigate("/dashboard")
  }
}, [loading, isAuthenticated, navigate])

  const handleSubmit = (e) => {
    console.log(authMode)
    e.preventDefault();
    

    if (authMode === "forgot") {
      if (loading) return
      sendResetPasswordEmail(email)
      setResetSent(true);
      return;
    }

    if(authMode === "signin"){
      console.log("Hello");
      if (loading) return
      loginFn({ email, password })

    }

    if (authMode === "signup") {
      signupFn({ name, email, password })
    }
  };

  async function handleGoogleAuth() {
  try {
    await loginWithGoogle();
  } catch (err) {
    toast.error(err.message);
  }
}


   return (
  <div className="relative isolate overflow-hidden 
                min-h-[calc(100vh-120px)] 
                flex items-center justify-center 
                pt-24 px-6 mb-5">

    {/* Aurora Background */}
    <div className="fixed inset-0 -z-10 pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
      {/* <Aurora
        colorStops={[
          "#020617",
          "#312e81",
          "#6366f1",
          "#22d3ee"
        ]}
        blend={0.18}
        amplitude={0.45}
        speed={0.25}
      />
     */}

     </div>

    {/* Ambient blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[140px] rounded-full" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[140px] rounded-full" />

    {/* Auth Card */}
    <div className="w-full max-w-md glass-morphism rounded-[3rem] p-10 md:p-14 border-white/5 shadow-2xl relative">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black border border-white/10 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Pitch Gym Access
        </div>

        <h2 className="text-4xl font-black tracking-tight uppercase leading-[1] mb-3">
          {authMode === "signup"
            ? "Create Account"
            : authMode === "forgot"
            ? "Reset Access"
            : "Sign In"}
        </h2>

        <p className="text-zinc-500 text-sm font-medium">
          Train like you’re already in the boardroom.
        </p>
      </div>

      {/* Google Auth */}
      {authMode !== "forgot" && (
        <>
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-black text-xs uppercase tracking-widest mb-6"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-4 h-4"
              alt="google"
            />
            {authMode === "signup" ? "Sign up with Google" : "Sign in with Google"}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
              <span className="bg-[#020617] px-4 text-zinc-600">
                or continue
              </span>
            </div>
          </div>
        </>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {authMode === "signup" && (
          <Input
            label="Full Name"
            value={name}
            setValue={setName}
            type="text"
            placeholder="Your Name"
          />
        )}

        <Input
          label="Email"
          value={email}
          setValue={setEmail}
          type="email"
          placeholder="you@startup.com"
        />

        {authMode !== "forgot" && (
          <Input
            label="Password"
            value={password}
            setValue={setPassword}
            type="password"
            placeholder="••••••••"
            extra={
              authMode === "signin" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className="text-[9px] uppercase tracking-widest font-black text-indigo-400 hover:underline"
                >
                  Forgot?
                </button>
              )
            }
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em]"
        >
          {isLoading
            ? "Processing..."
            : authMode === "signup"
            ? "Create Account"
            : authMode === "forgot"
            ? "Send Reset Link"
            : "Sign In"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-zinc-500">
        {authMode === "forgot" ? (
          <button
            onClick={() => setAuthMode("signin")}
            className="hover:text-white transition"
          >
            ← Back to Sign In
          </button>
        ) : (
          <>
            {authMode === "signup"
              ? "Already have an account?"
              : "New to Pitch Gym?"}
            <button
              onClick={() =>
                setAuthMode(authMode === "signup" ? "signin" : "signup")
              }
              className="ml-2 text-indigo-400 font-black hover:underline"
            >
              {authMode === "signup" ? "Sign In" : "Create Account"}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)

};

const Input = ({ label, value, setValue, type, placeholder, extra }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label className="text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {extra}
    </div>
    <input
      type={type}
      value={value}
      required
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/30 text-sm"
    />
  </div>
);

export default Auth;
  