import React, { useEffect, useState } from "react";
import {
  LoginApi,
  signup,
  loginWithGoogle,
  sendResetPasswordEmail,
} from "@/db/auth";
import { AuthState } from "@/context/authcontext.jsx";
import useFetch from "@/hooks/use-fetch";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose }) => {
  const [state, setState] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = AuthState();

  const { loading, fn: loginFn } = useFetch(LoginApi);
  const { loading: signupLoading, fn: signupFn } = useFetch(signup);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      onClose();
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state === "forgot") {
      if (loading) return;
      await sendResetPasswordEmail(email);
      setResetSent(true);
      return;
    }

    if (state === "login") {
      if (loading) return;
      loginFn({ email, password });
    }

    if (state === "signup") {
      if (signupLoading) return;
      signupFn({ name, email, password });
    }
  };

  const handleGoogleAuth = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md glass-morphism rounded-[2.5rem] border-white/5 p-8 md:p-12 shadow-2xl animate-float">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            ⚡
          </div>
          <h2 className="text-2xl font-black uppercase">
            {state === "login" && "Commander Access"}
            {state === "signup" && "Founder Registration"}
            {state === "forgot" && "Credential Reset"}
          </h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
            Pitch Gym AI Protocol
          </p>
        </div>

        {/* Reset success */}
        {state === "forgot" && resetSent ? (
          <div className="text-center space-y-6">
            <p className="text-white font-bold">
              Reset link sent to <br />
              <span className="text-indigo-400">{email}</span>
            </p>
            <button
              onClick={() => {
                setState("login");
                setResetSent(false);
              }}
              className="text-indigo-500 font-bold uppercase text-xs"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {/* Google */}
            {state !== "forgot" && (
              <>
                <button
                  onClick={handleGoogleAuth}
                  className="w-full glass-morphism border-white/10 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-white/5"
                >
                  Continue with Google
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                    <span className="bg-[#0c0c0e] px-2 text-zinc-600">
                      OR USE EMAIL
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {state === "signup" && (
                <Input
                  label="Full Name"
                  value={name}
                  setValue={setName}
                  placeholder="Sarah Chen"
                />
              )}

              <Input
                label="Email Terminal"
                type="email"
                value={email}
                setValue={setEmail}
                placeholder="sarah@founder.ai"
              />

              {state !== "forgot" && (
                <Input
                  label="Secure Password"
                  type="password"
                  value={password}
                  setValue={setPassword}
                  placeholder="••••••••"
                />
              )}

              <button className="w-full btn-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                {state === "login" && "Authorize Session"}
                {state === "signup" && "Deploy Protocol"}
                {state === "forgot" && "Send Link"}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          {state === "login" ? (
            <>
              <button
                onClick={() => setState("signup")}
                className="text-indigo-500 font-black text-[10px] uppercase tracking-widest"
              >
                Create New Account
              </button>
              <button
                onClick={() => setState("forgot")}
                className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest"
              >
                Forgot Credentials?
              </button>
            </>
          ) : (
            <button
              onClick={() => setState("login")}
              className="text-indigo-500 font-black text-[10px] uppercase tracking-widest"
            >
              Back to Authorization
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Input = ({
  label,
  value,
  setValue,
  type = "text",
  placeholder,
}) => (
  <div className="space-y-2">
    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-4">
      {label}
    </label>
    <input
      type={type}
      required
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
    />
  </div>
);

export default AuthModal;
