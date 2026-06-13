"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient"; 
import {
  Award,
  LogOut,
  Activity,
  Flame,
  Play,
  Square,
  Plus,
  CheckCircle,
  Trash2
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  // 1. Core Authentication & Profile States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Feature States: Live Study Timer
  const [isTiming, setIsTiming] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 3. Feature States: Local Task Manager
  const [tasks, setTasks] = useState<{ id: string; text: string }[]>([]);
  const [newTaskInput, setNewTaskInput] = useState<string>("");

  // --- HOOKS & AUTH GATE ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: activeUser } } = await supabase.auth.getUser();
        if (!activeUser) {
          window.location.href = "/login";
        } else {
          setUser(activeUser);
          await fetchProfile(activeUser.id);
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        window.location.href = "/login";
      }
    };
    checkUser();
  }, []);

  // Timer Interval Engine
  useEffect(() => {
    if (isTiming) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTiming]);


  // --- DATABASE OPERATIONS ---
  
  // Fetch profile details & run automated streak logic
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
        // Automatically check/update streak if it hasn't been updated today
        await checkAndHandleStreak(userId, data);
      }
    } catch (err) {
      console.error("Error connecting to profiles table:", err);
    } finally {
      setLoading(false);
    }
  };

  // Feature 1: Automated Streak Tracker Logic
  const checkAndHandleStreak = async (userId: string, currentProfile: any) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const lastLoginStr = currentProfile.last_login;

    if (lastLoginStr !== todayStr) {
      let newStreak = currentProfile.streak || 0;
      
      if (lastLoginStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastLoginStr === yesterdayStr) {
          newStreak += 1; // Logged in consecutive days!
        } else {
          newStreak = 1; // Broke streak, reset to 1
        }
      } else {
        newStreak = 1; // First time logging in ever
      }

      const { error } = await supabase
        .from("profiles")
        .update({ streak: newStreak, last_login: todayStr })
        .eq("id", userId);

      if (!error) {
        setProfile((prev: any) => ({ ...prev, streak: newStreak, last_login: todayStr }));
      }
    }
  };

  // Feature 2: Timer Sync Engine (Saves hours back to your database row)
  const toggleTimer = async () => {
    if (isTiming) {
      // Stopping the timer: calculate fraction of hours studied
      const hoursStudied = Number((secondsElapsed / 3600).toFixed(2));
      const updatedTotalHours = Number(((profile?.study_time || 0) + hoursStudied).toFixed(2));

      setIsTiming(false);
      setSecondsElapsed(0);

      // Save live metric back to Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ study_time: updatedTotalHours })
        .eq("id", user.id);

      if (!error) {
        setProfile((prev: any) => ({ ...prev, study_time: updatedTotalHours }));
      }
    } else {
      setIsTiming(true);
    }
  };

  // Feature 3: Task Manager Completion Engine
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), text: newTaskInput.trim() }]);
    setNewTaskInput("");
  };

  const completeTask = async (taskId: string) => {
    // Remove from active list
    setTasks(tasks.filter((t) => t.id !== taskId));
    
    // Increment total modules stat inside database counter
    const updatedCount = (profile?.completed_modules || 0) + 1;
    const { error } = await supabase
      .from("profiles")
      .update({ completed_modules: updatedCount })
      .eq("id", user.id);

    if (!error) {
      setProfile((prev: any) => ({ ...prev, completed_modules: updatedCount }));
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout execution failed:", err);
    }
  };

  // Format stopwatch seconds into crisp text display (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

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

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
            T
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r select-none from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            TAKSHA v2.0
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Welcome Block */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Level {profile?.level || "1"} Student
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-indigo-400">{profile?.full_name || user?.email?.split('@')[0]}</span>!
            </h1>
            <p className="text-slate-400 text-sm">
              Account: <span className="text-slate-300 font-medium">{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Metric 1: Study Time */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Study Time</p>
              <h3 className="text-3xl font-bold text-white mt-1">{profile?.study_time || "0"} hours</h3>
            </div>
          </div>

          {/* Metric 2: Streak counter */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 transition-all duration-300 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Daily Streak</p>
              <h3 className="text-3xl font-bold text-white mt-1">{profile?.streak || "0"} Days</h3>
            </div>
          </div>

          {/* Metric 3: Task counter */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Completed Modules</p>
              <h3 className="text-3xl font-bold text-white mt-1">{profile?.completed_modules || "0"} Tasks</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Features Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* FEATURE PANEL 1: Focus Stopwatch Timer */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Focus Session Timer</h2>
              <p className="text-sm text-slate-400 mt-1">Track your active deep work. Stopping the timer automatically saves hours directly to your total stats counter.</p>
            </div>

            <div className="py-8 text-center">
              <div className={`text-6xl font-black font-mono tracking-wider transition-all duration-300 ${isTiming ? "text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse" : "text-slate-500"}`}>
                {formatTime(secondsElapsed)}
              </div>
            </div>

            <button
              onClick={toggleTimer}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 border shadow-md ${
                isTiming 
                  ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white" 
                  : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-indigo-600/10"
              }`}
            >
              {isTiming ? (
                <>
                  <Square className="h-5 w-5 fill-current" />
                  <span>Stop & Save Focus Session</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  <span>Start Focus Session</span>
                </>
              )}
            </button>
          </div>

          {/* FEATURE PANEL 2: Interactive Module Task Manager */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Active Daily Targets</h2>
              <p className="text-sm text-slate-400 mt-1">Checking off a target automatically registers as a completed module in your profile summary record.</p>
            </div>

            {/* Tasks Feed Content */}
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 flex-grow">
              {tasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-600 text-sm font-medium py-8 select-none">
                  No active targets. Add a milestone below to begin!
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 group hover:border-indigo-500/20 transition-all duration-200">
                    <span className="text-sm text-slate-300 font-medium">{task.text}</span>
                    <button
                      onClick={() => completeTask(task.id)}
                      className="text-slate-500 hover:text-emerald-400 p-1 transition-colors duration-150"
                      title="Complete Target"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Inject Action Input Input Footer */}
            <form onSubmit={addTask} className="flex items-center gap-2 mt-auto">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="e.g., Review Buck Converter Formulas..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none placeholder-slate-600 transition-all duration-200"
              />
              <button
                type="submit"
                className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-colors duration-150 shadow-md shadow-indigo-600/10"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}