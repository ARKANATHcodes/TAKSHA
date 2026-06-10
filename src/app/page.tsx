"use client";

import React, { useState } from "react";
import { Play, Flame, Award, Clock, ChevronRight, CheckCircle, Video } from "lucide-react";

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeLecture, setActiveLecture] = useState({
    id: 1,
    title: "12. Understanding Pointers & Memory Allocation",
    course: "Intro to C Programming",
    duration: "45 mins",
    progress: 78,
    instructor: "Dr. Elena Vance",
    category: "c-prog",
  });

  const courses = [
    { id: "c-prog", name: "C Programming", count: 8, color: "from-blue-500 to-indigo-600" },
    { id: "data-struct", name: "Data Structures", count: 12, color: "from-emerald-500 to-teal-600" },
    { id: "web-dev", name: "Web Development", count: 10, color: "from-amber-500 to-orange-600" },
  ];

  const lectures = [
    {
      id: 1,
      title: "12. Understanding Pointers & Memory Allocation",
      course: "Intro to C Programming",
      duration: "45 mins",
      progress: 78,
      instructor: "Dr. Elena Vance",
      category: "c-prog",
    },
    {
      id: 2,
      title: "08. Binary Search Trees & AVL Balancing",
      course: "Data Structures",
      duration: "52 mins",
      progress: 45,
      instructor: "Prof. Arthur Pendelton",
      category: "data-struct",
    },
    {
      id: 3,
      title: "15. State Management with React Context API",
      course: "Web Development",
      duration: "38 mins",
      progress: 90,
      instructor: "Sarah Jenkins",
      category: "web-dev",
    },
    {
      id: 4,
      title: "13. Structs, Unions & Bitfields in C",
      course: "Intro to C Programming",
      duration: "30 mins",
      progress: 0,
      instructor: "Dr. Elena Vance",
      category: "c-prog",
    },
  ];

  const weeklyStats = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 4.2 },
    { day: "Wed", hours: 1.8 },
    { day: "Thu", hours: 3.5 },
    { day: "Fri", hours: 5.0 },
    { day: "Sat", hours: 2.0 },
    { day: "Sun", hours: 0.8 },
  ];

  const maxHours = Math.max(...weeklyStats.map(d => d.hours));

  const filteredLectures = selectedCourse === "all" 
    ? lectures 
    : lectures.filter(l => l.category === selectedCourse);

  return (
    <div className="space-y-6">
      {/* Header Profile Section */}
      <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
            AM
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Welcome back,</span>
            <span className="text-base font-semibold text-white">Alex Mercer</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/20 text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            5 Days
          </div>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/30 p-3 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
          <Clock className="w-5 h-5 text-indigo-400 mb-2" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Study Time</span>
            <span className="text-lg font-bold text-slate-100">19.8h</span>
          </div>
        </div>
        <div className="bg-slate-800/30 p-3 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
          <Award className="w-5 h-5 text-emerald-400 mb-2" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Rank Badge</span>
            <span className="text-lg font-bold text-slate-100">Level 4</span>
          </div>
        </div>
        <div className="bg-slate-800/30 p-3 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
          <CheckCircle className="w-5 h-5 text-indigo-400 mb-2" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-lg font-bold text-slate-100">14/22</span>
          </div>
        </div>
      </div>

      {/* Featured Video Player Placeholder */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-400" />
          Active Lecture
        </h2>
        
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-xl group">
          {/* Dynamic Video Frame (Placeholder styling) */}
          <div className="aspect-video w-full bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 flex flex-col justify-between p-4 relative">
            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors duration-300" />
            
            {/* Top Row inside Video */}
            <div className="z-10 flex justify-between items-start">
              <span className="text-[10px] bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-indigo-300 font-semibold border border-indigo-500/20">
                {activeLecture.course}
              </span>
              <span className="text-[10px] bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-300 font-semibold">
                {activeLecture.duration}
              </span>
            </div>

            {/* Play Button Overlay */}
            <div className="z-10 flex justify-center items-center">
              <button 
                onClick={() => alert(`Starting Video: ${activeLecture.title}`)}
                className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </button>
            </div>

            {/* Bottom Progress Overlay */}
            <div className="z-10 space-y-1.5">
              <h3 className="text-xs md:text-sm font-semibold text-slate-100 line-clamp-1">
                {activeLecture.title}
              </h3>
              <p className="text-[10px] text-slate-400">
                Instructor: {activeLecture.instructor}
              </p>
              
              {/* Custom styled progress slider */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${activeLecture.progress}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[9px] text-indigo-400 font-semibold">
                  <span>{activeLecture.progress}% Completed</span>
                  <span>10 mins left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Selectors */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white">Course Tracks</h2>
          <button 
            onClick={() => setSelectedCourse("all")}
            className={`text-xs ${selectedCourse === "all" ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
          >
            Show All
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className={`snap-start flex-shrink-0 text-left p-3 rounded-2xl w-36 border transition-all duration-200 cursor-pointer ${
                selectedCourse === course.id
                  ? "bg-slate-800 border-indigo-500 shadow-md"
                  : "bg-slate-800/30 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${course.color} flex items-center justify-center font-bold text-xs text-white mb-3 shadow-md`}>
                {course.name[0]}
              </div>
              <h3 className="text-xs font-bold text-white line-clamp-1">{course.name}</h3>
              <span className="text-[10px] text-slate-400">{course.count} lectures</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Lectures List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">Lectures Playlists ({filteredLectures.length})</h2>
        <div className="space-y-2.5">
          {filteredLectures.map((lecture) => (
            <div
              key={lecture.id}
              onClick={() => setActiveLecture(lecture)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                activeLecture.id === lecture.id
                  ? "bg-indigo-950/20 border-indigo-500/40"
                  : "bg-slate-800/20 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  activeLecture.id === lecture.id ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                }`}>
                  <Play className={`w-4 h-4 ${activeLecture.id === lecture.id ? "fill-indigo-400" : ""}`} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 group-hover:text-white">
                    {lecture.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{lecture.course}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>{lecture.duration}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Orientation Log Weekly Progress Chart */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">Orientation & Study Log</h2>
        <div className="bg-slate-800/20 border border-slate-800/60 p-4 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block">Weekly Goal Progress</span>
              <span className="text-lg font-bold text-white">19.8 / 25 Hours</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg font-medium">
              +15% vs Last Week
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="flex justify-between items-end h-28 pt-2">
            {weeklyStats.map((stat) => {
              const heightPercent = (stat.hours / maxHours) * 100;
              return (
                <div key={stat.day} className="flex flex-col items-center gap-2 flex-1 group">
                  {/* Tooltip on Hover */}
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -translate-y-8 font-semibold">
                    {stat.hours}h
                  </span>
                  
                  {/* Bar */}
                  <div className="w-6 bg-slate-800 rounded-lg h-full flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-lg transition-all duration-700 group-hover:from-indigo-500 group-hover:to-violet-400"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-300 font-medium">
                    {stat.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
