'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Lecture {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  video_url: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<Lecture | null>(null);

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  // Pull records from cloud cluster
  useEffect(() => {
    async function fetchLectures() {
      setLoading(true);
      const { data, error } = await supabase
        .from('lectures')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        setLectures(data as any);
      }
      setLoading(false);
    }
    fetchLectures();
  }, []);

  // Format engine for matching players
  function formatVideoUrl(url: string) {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  }

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lecture.description && lecture.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || lecture.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative">
      <div className="max-w-6xl mx-auto">

        {/* Header Banner */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            Cloud Search Engine
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Instantly query core physics laboratory tutorials and advanced power machinery simulations loaded straight from the matrix database.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Search concepts across the cloud database registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-violet-500 text-white placeholder-slate-500 shadow-inner"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-300 font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Physics Labs">Physics Labs</option>
              <option value="Electrical Eng">Electrical Eng</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="text-center py-24 text-slate-500 text-sm tracking-widest font-mono animate-pulse">
            PINGING LECTURE STORAGE CLUSTERS...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition duration-300 hover:shadow-xl hover:shadow-violet-950/10 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${lecture.category === 'Physics Labs' ? 'bg-amber-950 text-amber-400 border border-amber-900/60' : 'bg-cyan-950 text-cyan-400 border border-cyan-900/60'
                      }`}>
                      {lecture.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">{lecture.duration}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-violet-400 transition mb-2">
                    {lecture.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {lecture.description}
                  </p>
                </div>

                <button
                  onClick={() => setActiveVideo(lecture)}
                  className="w-full bg-slate-950 border border-slate-800 hover:bg-violet-600 hover:border-violet-500 text-slate-300 hover:text-white transition font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2"
                >
                  <span>▶</span> <span>Launch Module</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty Alert */}
        {!loading && filteredLectures.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <p className="text-sm text-slate-500">No database resources match your query criteria.</p>
          </div>
        )}

      </div>

      {/* Theater Modal with Integrated Diagnostic Hatch */}
      {activeVideo && (() => {
        const structuralUrl = formatVideoUrl(activeVideo.video_url);
        const isYouTube = structuralUrl.includes('youtube.com/embed');

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-black"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    System Player Sandbox
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 truncate max-w-md md:max-w-xl">{activeVideo.title}</h4>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900 font-mono text-xs px-3 py-1 rounded-lg transition"
                >
                  ✕ Close
                </button>
              </div>

              {/* Core Widescreen Display Cage */}
              <div className="relative aspect-video bg-black">
                {isYouTube ? (
                  <iframe
                    src={structuralUrl}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={structuralUrl}
                    controls
                    className="absolute inset-0 w-full h-full"
                  ></video>
                )}
              </div>

              {/* 🛠️ NEW DIAGNOSTIC ESCAPE HATCH BAR */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400 mb-1.5">
                  Is the player box above stuck or spinning? Your local browser environments might be blocking embedded frames.
                </p>
                <a
                  href={activeVideo.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-violet-400 hover:text-violet-300 underline decoration-violet-500/50 hover:decoration-violet-400 transition"
                >
                  <span>🔗 Click here to test & open the video link directly in a new tab</span>
                </a>
              </div>

              {/* Basic Meta Footer */}
              <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center font-mono">
                <span>CAT: {activeVideo.category}</span>
                <span>TIME: {activeVideo.duration}</span>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}