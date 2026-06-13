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
  HelpCircle,
  BookOpen,
  Sun,
  Moon,
  User,
  Target,
  MapPin,
  GraduationCap,
  FolderUp
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  // Core Authentication & Profile States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Global Theme Manager (Default to true/dark)
  const [isDark, setIsDark] = useState<boolean>(true);

  // Onboarding Form States
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: "",
    preparation_for: "",
    state: "",
    city: ""
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Feature States: Live Study Timer
  const [isTiming, setIsTiming] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Feature States: Local Task Manager
  const [tasks, setTasks] = useState<{ id: string; text: string }[]>([]);
  const [newTaskInput, setNewTaskInput] = useState<string>("");

  // --- THEME LOAD ENGINE ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("taksha-theme");
    if (savedTheme === "light") {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem("taksha-theme", nextTheme ? "dark" : "light");
  };

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
        
        // Check if onboarding data is missing
        if (!data.username || !data.preparation_for) {
          setIsOnboarding(true);
          setFormData({
            username: data.username || "",
            preparation_for: data.preparation_for || "",
            state: data.state || "",
            city: data.city || ""
          });
        }

        await checkAndHandleStreak(userId, data);
      }
    } catch (err) {
      console.error("Error connecting to profiles table:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Onboarding Profile Submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.preparation_for.trim()) return;

    setFormSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username.trim(),
          preparation_for: formData.preparation_for.trim(),
          state: formData.state.trim(),
          city: formData.city.trim()
        })
        .eq("id", user.id);

      if (!error) {
        setProfile((prev: any) => ({
          ...prev,
          ...formData
        }));
        setIsOnboarding(false);
      } else {
        alert("Error saving your profile details. Please try again.");
      }
    } catch (err) {
      console.error("Onboarding submission error:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

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
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
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

  const toggleTimer = async () => {
    if (isTiming) {
      const hoursStudied = Number((secondsElapsed / 3600).toFixed(2));
      const updatedTotalHours = Number(((profile?.study_time || 0) + hoursStudied).toFixed(2));
      setIsTiming(false);
      setSecondsElapsed(0);

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

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), text: newTaskInput.trim() }]);
    setNewTaskInput("");
  };

  const completeTask = async (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
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

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-[#0f172a] text-white" : "bg-slate-50 text-slate-900"}`}>
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDark ? "bg-[#0f172a] text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* HEADER NAVBAR */}
      <header className={`border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur transition-colors ${
        isDark ? "border-slate-800 bg-[#0f172a]/80" : "border-slate-200 bg-white/80"
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/profile"}>
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
              T
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              TAKSHA v2.0
            </span>
          </div>

          {!isOnboarding && (
            <nav className={`hidden md:flex items-center gap-5 border-l pl-6 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <button onClick={() => window.location.href = "/profile"} className="text-sm font-semibold text-indigo-500">Dashboard</button>
              <button onClick={() => window.location.href = "/quiz"} className={`text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"}`}>Quiz Hub</button>
              <button onClick={() => window.location.href = "/formulas"} className={`text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"}`}>Cheat Sheets</button>
              
              {/* 🛠️ ADDED: AI Teacher Route Link */}
              <button 
                onClick={() => window.location.href = "/teacher"} 
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${isDark ? "text-slate-400 hover:text-violet-400" : "text-slate-500 hover:text-violet-600"}`}
              >
                <GraduationCap className="h-4 w-4" /> AI Teacher
              </button>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              isDark ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800" : "bg-white border-slate-200 text-violet-600 hover:bg-slate-100 shadow-sm"
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* DYNAMIC HUB CONTENT VIEW */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {isOnboarding ? (
          /* ONBOARDING DATA COLLECTION FORM */
          <div className="max-w-md mx-auto pt-6">
            <div className={`border p-6 md:p-8 rounded-2xl space-y-6 shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="space-y-2 text-center">
                <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Configure Your Targets</h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Customize your TAKSHA tracking profile before continuing.</p>
              </div>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Chosen Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g., alex_codes"
                    className={`w-full rounded-xl px-4 py-3 text-sm outline-none border ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> What are you preparing for?</label>
                  <input
                    type="text"
                    required
                    value={formData.preparation_for}
                    onChange={(e) => setFormData({ ...formData, preparation_for: e.target.value })}
                    placeholder="e.g., GATE Exam, University Engineering"
                    className={`w-full rounded-xl px-4 py-3 text-sm outline-none border ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g., MH, DL"
                      className={`w-full rounded-xl px-4 py-3 text-sm outline-none border ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Mumbai, Pune"
                      className={`w-full rounded-xl px-4 py-3 text-sm outline-none border ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full mt-2 py-3.5 bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-md shadow-indigo-600/10 transition-colors"
                >
                  {formSubmitting ? "Locking Profile..." : "Unlock Dashboard"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* STANDARD DASHBOARD VIEW SECTION */
          <>
            {/* Welcome Block Header with custom @username replacement */}
            <div className={`relative rounded-2xl overflow-hidden border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${
              isDark ? "bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Level {profile?.level || "1"} Student
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Target: {profile?.preparation_for}
                  </span>
                </div>
                {/* 🛠️ UPDATED: Addressed by username dynamically */}
                <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Welcome, <span className="text-indigo-500">@{profile?.username || "student"}</span>!
                </h1>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Location: <span className="font-semibold">{profile?.city || "Unknown"}, {profile?.state || "IN"}</span>
                </p>
              </div>
            </div>

            {/* QUICK LAUNCH HOTBAR CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => window.location.href = "/quiz"}
                className={`p-4 rounded-xl border text-left flex items-center justify-between group transition-all duration-200 ${
                  isDark ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-500/30" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-500/30 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Launch Quiz Hub</h4>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Test engineering & physics loops.</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-indigo-500 transition-colors font-bold text-lg">→</span>
              </button>

              <button 
                onClick={() => window.location.href = "/formulas"}
                className={`p-4 rounded-xl border text-left flex items-center justify-between group transition-all duration-200 ${
                  isDark ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-violet-500/30" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-violet-500/30 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Formula Cheat Sheets</h4>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Review active physics formulations.</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-violet-400 transition-colors font-bold text-lg">→</span>
              </button>

              {/* 🛠️ ADDED: Task Submission Portal Card */}
              <button 
                onClick={() => window.location.href = "/submission"}
                className={`p-4 rounded-xl border text-left flex items-center justify-between group transition-all duration-200 ${
                  isDark ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-500/30 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FolderUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Task Submission Form</h4>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Upload mandatory project files.</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-500 transition-colors font-bold text-lg">→</span>
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark ? "bg-slate-900 border-slate-800 hover:border-indigo-500/30" : "bg-white border-slate-200 hover:border-indigo-500/30 shadow-sm"
              }`}>
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total Study Time</p>
                  <h3 className={`text-3xl font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>{profile?.study_time || "0"} hours</h3>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark ? "bg-slate-900 border-slate-800 hover:border-violet-500/30" : "bg-white border-slate-200 hover:border-violet-500/30 shadow-sm"
              }`}>
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Daily Streak</p>
                  <h3 className={`text-3xl font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>{profile?.streak || "0"} Days</h3>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4 sm:col-span-2 lg:col-span-1 ${
                isDark ? "bg-slate-900 border-slate-800 hover:border-emerald-500/30" : "bg-white border-slate-200 hover:border-emerald-500/30 shadow-sm"
              }`}>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Completed Modules</p>
                  <h3 className={`text-3xl font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>{profile?.completed_modules || "0"} Tasks</h3>
                </div>
              </div>
            </div>

            {/* Workspaces Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Focus Stopwatch Timer */}
              <div className={`p-6 rounded-2xl border space-y-6 flex flex-col justify-between ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Focus Session Timer</h2>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Track your active deep work.</p>
                </div>
                <div className="py-8 text-center">
                  <div className={`text-6xl font-black font-mono tracking-wider transition-all duration-300 ${
                    isTiming ? "text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse" : (isDark ? "text-slate-600" : "text-slate-300")
                  }`}>
                    {formatTime(secondsElapsed)}
                  </div>
                </div>
                <button
                  onClick={toggleTimer}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 border shadow-md ${
                    isTiming ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white" : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"
                  }`}
                >
                  {isTiming ? <><Square className="h-5 w-5 fill-current" /> Stop & Save Focus</> : <><Play className="h-5 w-5 fill-current" /> Start Focus Session</>}
                </button>
              </div>

              {/* Interactive Task Manager */}
              <div className={`p-6 rounded-2xl border space-y-6 flex flex-col justify-between ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Active Daily Targets</h2>
                </div>
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 flex-grow">
                  {tasks.length === 0 ? (
                    <div className={`h-full flex items-center justify-center text-center text-sm py-8 select-none ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                      No active targets. Add a milestone below to begin!
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                        <span className={isDark ? "text-slate-300 text-sm font-medium" : "text-slate-700 text-sm font-medium"}>{task.text}</span>
                        <button onClick={() => completeTask(task.id)} className="text-slate-400 hover:text-emerald-500 p-1 transition-colors">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={addTask} className="flex items-center gap-2 mt-auto">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="e.g., Review Buck Converter Formulas..."
                    className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none border transition-all ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500"
                    }`}
                  />
                  <button type="submit" className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-md">
                    <Plus className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}