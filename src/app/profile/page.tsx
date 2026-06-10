"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  User, 
  Mail, 
  Lock, 
  Award, 
  BookOpen, 
  Calendar, 
  LogOut, 
  CheckCircle2, 
  Activity,
  Flame,
  KeyRound
} from "lucide-react";

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 1. Fetch Auth State & Profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Register/Login Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setFormLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setAuthSuccess("Logged in successfully!");
      } else {
        // Sign Up
        if (!username.trim()) {
          throw new Error("Username is required.");
        }
        
        // Check standard signup options. 
        // metadata is sent to auth trigger handles profile inserts
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });
        if (error) throw error;
        setAuthSuccess("Account created! Check your email for verification");
      }
    } catch (err: any) {
      setAuthError(err.message || "An authentication error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  // Interactive student metrics (mock stats linked to profile)
  const studentStats = {
    lecturesCompleted: 14,
    totalLectures: 22,
    studyHours: "19.8 hrs",
    xpPoints: 1240,
    academicStreak: 5,
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          My Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account credentials, view study metrics, and accomplishments.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          Loading profile details...
        </div>
      ) : session ? (
        /* ================= AUTHENTICATED STATE ================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* User Hero Badge */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20">
                {(profile?.username || session.user.email)?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs text-indigo-400 font-semibold block mb-1">
                  Welcome back, Student!
                </span>
                <h2 className="text-lg font-bold text-white leading-none">
                  u/{profile?.username || session.user.email.split("@")[0]}
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* Profile Meta Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-850 pt-5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Joined {new Date(session.user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Online Database Synced</span>
              </div>
            </div>
          </div>

          {/* Student Progress Metrics Dashboard */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              Academic Dashboard
            </h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-slate-800/20 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Lectures Watched</span>
                  <span className="text-base font-bold text-slate-100 block mt-0.5">
                    {studentStats.lecturesCompleted} / {studentStats.totalLectures}
                  </span>
                  <span className="text-[9px] text-indigo-400 font-semibold block mt-1">63% Completed</span>
                </div>
              </div>

              <div className="bg-slate-800/20 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
                <Activity className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Study Hours</span>
                  <span className="text-base font-bold text-slate-100 block mt-0.5">
                    {studentStats.studyHours}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-semibold block mt-1">+2.4h this week</span>
                </div>
              </div>

              <div className="bg-slate-800/20 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
                <Flame className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Daily Streak</span>
                  <span className="text-base font-bold text-slate-100 block mt-0.5">
                    {studentStats.academicStreak} Days
                  </span>
                  <span className="text-[9px] text-amber-400 font-semibold block mt-1">Keep it up!</span>
                </div>
              </div>

              <div className="bg-slate-800/20 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
                <Award className="w-5 h-5 text-violet-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Scholar XP</span>
                  <span className="text-base font-bold text-slate-100 block mt-0.5">
                    {studentStats.xpPoints} XP
                  </span>
                  <span className="text-[9px] text-violet-400 font-semibold block mt-1">160 XP to level up</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Accomplishments list */}
          <div className="bg-slate-800/10 border border-slate-800/60 rounded-3xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Unlocked Badges</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-slate-900/30 rounded-xl border border-slate-850">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Hello World Compiler</span>
                  <span className="text-[9px] text-slate-400">Completed 1st lecture and program compile.</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-900/30 rounded-xl border border-slate-850">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Community Scholar</span>
                  <span className="text-[9px] text-slate-400">Created a post and commented in the P2P Forum.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800/60 hover:bg-red-500/10 border border-slate-750 hover:border-red-500/30 text-slate-300 hover:text-red-400 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Log Out Account</span>
          </button>

        </div>
      ) : (
        /* ================= UNAUTHENTICATED STATE (LOGIN/SIGNUP) ================= */
        <div className="bg-slate-800/20 border border-slate-800/60 p-5 rounded-3xl space-y-6 animate-in fade-in duration-300 shadow-md">
          {/* Header toggler */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850">
            <button
              onClick={() => {
                setIsLogin(true);
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLogin 
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isLogin 
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form details instructions */}
          <div className="text-center px-4 space-y-1.5">
            <h2 className="text-base font-bold text-white">
              {isLogin ? "Welcome Back Student" : "Create Student Account"}
            </h2>
            <p className="text-[10px] text-slate-400 leading-normal">
              {isLogin 
                ? "Enter your credentials to access study progress metrics." 
                : "Register with Supabase to synch upvote posts & write comments."}
            </p>
          </div>

          {/* Error and Success Alerts */}
          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs text-center font-medium">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs text-center font-medium">
              {authSuccess}
            </div>
          )}

          {/* Auth form inputs */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-semibold uppercase block">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="student_42"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              {formLoading ? "Processing..." : isLogin ? "Authenticate" : "Register Credentials"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
