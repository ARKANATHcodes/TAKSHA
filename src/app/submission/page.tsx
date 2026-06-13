"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link2, ArrowLeft, CheckCircle2, FileText, Presentation, FileCode } from "lucide-react";

export default function SubmissionPage() {
  const router = useRouter();
  
  // Theme State syncing with your platform settings
  const [isDark, setIsDark] = useState<boolean>(true);
  
  // Form Submission and File States
  const [executiveDoc, setExecutiveDoc] = useState<File | null>(null);
  const [presentation, setPresentation] = useState<File | null>(null);
  const [aiReport, setAiReport] = useState<File | null>(null);
  const [prototypeUrl, setPrototypeUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("taksha-theme");
    if (savedTheme === "light") setIsDark(false);
  }, []);

  // Generic handler to mimic a file explorer selection trigger
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!executiveDoc || !presentation || !aiReport) {
      alert("Please upload all mandatory required (*) files before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    // Simulated upload processing delay
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Project submission uploaded successfully to production!");
      window.location.href = "/profile";
    }, 1500);
  };

  return (
    <div className={`min-h-screen font-sans p-6 md:p-12 transition-colors duration-200 ${
      isDark ? "bg-[#0f172a] text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top Sticky Header bar navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'}">
          <button 
            onClick={() => window.location.href = "/profile"}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              isDark 
                ? "border-slate-800 bg-slate-900 text-slate-400 hover:text-white" 
                : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          <span className="text-xs font-bold font-mono tracking-wider text-indigo-500 uppercase">
            Task Submission Phase
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Executive Document Upload */}
          <div className={`p-6 md:p-8 rounded-2xl border transition-all ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Upload Executive Document <span className="text-red-500 font-bold">*</span>
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Upload 1 supported file. Max 100 MB.
              </p>
            </div>
            
            <div className="mt-5">
              <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                executiveDoc 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : (isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm")
              }`}>
                {executiveDoc ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4 text-indigo-500" />}
                {executiveDoc ? executiveDoc.name : "Add File"}
                <input 
                  type="file" 
                  className="hidden" 
                  required
                  onChange={(e) => handleFileChange(e, setExecutiveDoc)}
                />
              </label>
            </div>
          </div>

          {/* Card 2: Presentation Upload */}
          <div className={`p-6 md:p-8 rounded-2xl border transition-all ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Upload Presentation <span className="text-red-500 font-bold">*</span>
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Upload 1 supported file. Max 100 MB.
              </p>
            </div>
            
            <div className="mt-5">
              <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                presentation 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : (isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm")
              }`}>
                {presentation ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4 text-indigo-500" />}
                {presentation ? presentation.name : "Add File"}
                <input 
                  type="file" 
                  className="hidden" 
                  required
                  onChange={(e) => handleFileChange(e, setPresentation)}
                />
              </label>
            </div>
          </div>

          {/* Card 3: AI Usage Reports Upload */}
          <div className={`p-6 md:p-8 rounded-2xl border transition-all ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Upload AI Usage Reports <span className="text-red-500 font-bold">*</span>
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Upload 1 supported file. Max 100 MB.
              </p>
            </div>
            
            <div className="mt-5">
              <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                aiReport 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : (isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm")
              }`}>
                {aiReport ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4 text-indigo-500" />}
                {aiReport ? aiReport.name : "Add File"}
                <input 
                  type="file" 
                  className="hidden" 
                  required
                  onChange={(e) => handleFileChange(e, setAiReport)}
                />
              </label>
            </div>
          </div>

          {/* Card 4: Prototype URL Text Input field */}
          <div className={`p-6 md:p-8 rounded-2xl border transition-all ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="space-y-3">
              <label className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                Prototype URL (if any)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Link2 className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  value={prototypeUrl}
                  onChange={(e) => setPrototypeUrl(e.target.value)}
                  placeholder="https://your-prototype-link.com"
                  className={`w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none border transition-all ${
                    isDark 
                      ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500" 
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 shadow-sm"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Operational Core Dispatch Form Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/10 transition-colors"
          >
            {isSubmitting ? "Uploading Materials..." : "Submit Project Folder"}
          </button>

        </form>
      </div>
    </div>
  );
}