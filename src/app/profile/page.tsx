"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient"; 
import {
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
  const router = useRouter();

  // 1. Core State Management (With generic types to satisfy TypeScript)
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // 2. Auth Security Gate: Runs once on page mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: activeUser } } = await supabase.auth.getUser();
        if (!activeUser) {
          router.push("/login"); // Route unauthenticated traffic away
        } else {
          setUser(activeUser);
          await fetchProfile(activeUser.id); // Fetch accompanying user records
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        router.push("/login");
      }
    };
    checkUser();
  }, [router]);

  // 3. Auth Listener: Tracks credential token mutations
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(currentSession.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 4. Data Sync: Read matching Row from database 'profiles' table
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
      console.error("Error connecting to profiles table:", err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Action Handler: Clean Sign Out Sequence
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout execution failed:", err);
    }
  };

  // 6. Visual Fallback: Prevents layout flashing while loading states resolve
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] text-white">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-400 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // 7. Core User Interface Layout
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Navbar / Top Header Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
            T
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r select-none from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            TAKSHA v2.0
          </span>
        </div>
        
        {/* Dynamic Action Sign Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Structural Layout Wrap */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Welcome Dashboard Profile Block */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Level {profile?.level || "1"} Student
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-indigo-400">{profile?.full_name || user?.email?.split('@')[0]}</span>!
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Account Registered: <span className="text-slate-300 font-medium">{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Statistical Metas Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module Metric 1: Study Tracker */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 group space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Study Time</p>
              <h3 className="text-3xl font-bold text-white mt-1">{profile?.study_time || "0"} hours</h3>
            </div>
          </div>

          {/* Module Metric 2: Attendance Streak */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 transition-all duration-300 group space-y-4">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Daily Streak</p>
              <h3 className="text-3xl font-bold text-white mt-1">{profile?.streak || "0"} Days</h3>
            </div>
          </div>

          {/* Module Metric 3: Goal Evaluation Progress */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 group space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Completed Modules</p>
              <h3 className="text-3xl font-bold text-white mt-1">{profile?.completed_modules || "0"} Tasks</h3>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}