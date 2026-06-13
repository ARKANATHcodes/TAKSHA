"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient"; // Adjust if your path is different

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      // Handle User Registration
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("Success! Check your email for a confirmation link.");
      }
    } else {
      // Handle User Login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        // Send user straight to the main dashboard upon success
        window.location.href = "/profile";
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[#1e293b] p-8 shadow-xl border border-slate-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-indigo-400">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isSignUp ? "Join the TAKSHA learning community" : "Sign in to access your dashboard"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          <div>
            <label className="block text-sm font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg bg-[#0f172a] border border-slate-700 p-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg bg-[#0f172a] border border-slate-700 p-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
          {message && <p className="text-sm text-green-400 bg-green-500/10 p-2 rounded">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-400 hover:underline focus:outline-none"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}