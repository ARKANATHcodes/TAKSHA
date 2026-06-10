'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  upvotes: number; // Added to interface tracking
  profiles?: {
    username: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
}

export default function ForumPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [upvotedPosts, setUpvotedPosts] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');

  const [authChecking, setAuthChecking] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activePostComments, setActivePostComments] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    async function checkAuthAndLoad() {
      setAuthChecking(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/profile');
      } else {
        setUser(user);
        setAuthChecking(false);
        setPostsLoading(true);

        // Pulled upvotes explicitly from DB array
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select(`
            id, title, content, category, created_at, user_id, upvotes,
            profiles ( username )
          `)
          .order('created_at', { ascending: false });

        if (!fetchError && data) {
          setPosts(data as any);
        }
        setPostsLoading(false);
      }
    }
    checkAuthAndLoad();
  }, [router]);

  async function refreshFeed() {
    const { data } = await supabase
      .from('posts')
      .select(`
        id, title, content, category, created_at, user_id, upvotes,
        profiles ( username )
      `)
      .order('created_at', { ascending: false });
    if (data) setPosts(data as any);
  }

  // NEW FEATURE: Atomic Database Upvote Router Increment Function
  async function handleUpvote(postId: string, currentUpvotes: number) {
    // If this post ID is already in our upvoted list, stop right here!
    if (upvotedPosts.includes(postId)) return;

    const targetUpvotes = (currentUpvotes || 0) + 1;

    const { error } = await supabase
      .from('posts')
      .update({ upvotes: targetUpvotes })
      .eq('id', postId);

    if (!error) {
      // Save this post ID to our local "already voted" list
      setUpvotedPosts(prev => [...prev, postId]);

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, upvotes: targetUpvotes } : post
        )
      );
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title || !content) {
      setErrorMsg('Please fill out both the title and discussion text.');
      return;
    }

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          category,
          user_id: user.id,
          upvotes: 0 // Initialize at baseline zero metric
        },
      ]);

    if (error) {
      setErrorMsg(`Database error: ${error.message}`);
    } else {
      setSuccessMsg('Discussion published successfully!');
      setTitle('');
      setContent('');
      await refreshFeed();
    }
  }

  async function toggleComments(postId: string) {
    if (activePostComments === postId) {
      setActivePostComments(null);
      return;
    }

    setActivePostComments(postId);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) setCommentsList(data);
  }

  async function handleAddComment(e: React.FormEvent, postId: string) {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content: newCommentText,
          user_id: user.id,
        },
      ]);

    if (!error) {
      setNewCommentText('');
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (data) setCommentsList(data);
    }
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="text-sm font-medium tracking-widest text-violet-400 uppercase animate-pulse mb-2">
          Verifying Security Credentials...
        </div>
        <p className="text-xs text-slate-500">Checking active cluster tokens.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-24">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-violet-400">TAKSHA P2P Forum</h1>
          <p className="text-slate-400 text-sm mt-1">Discuss homework problems, physics lab setups, and circuit engineering formulas with peers.</p>
        </div>

        {/* Create Post Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Start a New Discussion</h2>

          {errorMsg && <div className="bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-lg mb-4 text-sm">{errorMsg}</div>}
          {successMsg && <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-400 p-3 rounded-lg mb-4 text-sm">{successMsg}</div>}

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Topic Title</label>
              <input
                type="text"
                placeholder="e.g., Boyle's Law syringe experiment tension calculation help"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Category Field</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 text-slate-300"
                >
                  <option value="General">General Engineering Chat</option>
                  <option value="Physics">Physics Labs & Laws</option>
                  <option value="Electrical Eng">Electrical Machinery & Circuits</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Your Explanation / Question</label>
              <textarea
                rows={4}
                placeholder="Describe your calculation challenge or bug here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 transition px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg shadow-violet-900/20"
            >
              Publish Post
            </button>
          </form>
        </div>

        {/* Discussion Live Feed List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-300 mb-2">Live Discussions Feed</h2>

          {postsLoading ? (
            <div className="text-center text-slate-500 text-sm py-12">Loading cluster network modules...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-12 border border-dashed border-slate-800 rounded-xl">No active discussions found. Be the first to publish a challenge!</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${post.category === 'Physics' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      post.category === 'Electrical Eng' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                      {post.category}
                    </span>
                    <span className="text-xs font-mono text-violet-400 font-semibold bg-violet-950/30 px-2 py-0.5 rounded border border-violet-900/40">
                      @{post.profiles?.username || 'peer_learner'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-semibold text-slate-100 mb-2">{post.title}</h3>
                <p className="text-slate-300 text-sm whitespace-pre-wrap mb-4">{post.content}</p>

                <div className="flex items-center space-x-6 border-t border-slate-800/60 pt-4">
                  {/* UPGRADED INTERACTIVE TRIGGER CALL BUTTON */}
                  <button
                    onClick={() => handleUpvote(post.id, post.upvotes)}
                    disabled={upvotedPosts.includes(post.id)}
                    className={`flex items-center space-x-1.5 text-xs font-medium transition group ${upvotedPosts.includes(post.id)
                        ? 'text-emerald-500 cursor-not-allowed opacity-80'
                        : 'text-slate-400 hover:text-emerald-400'
                      }`}
                  >
                    <span>▲</span>
                    <span>{upvotedPosts.includes(post.id) ? 'Upvoted' : 'Upvote'} ({post.upvotes || 0})</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition"
                  >
                    💬 <span>{activePostComments === post.id ? 'Hide Comments' : 'View Comments'}</span>
                  </button>
                </div>

                {activePostComments === post.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/40 p-4 rounded-lg">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Peer Answers</h4>

                    <div className="space-y-3 mb-4">
                      {commentsList.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No answers written yet.</p>
                      ) : (
                        commentsList.map((comment) => (
                          <div key={comment.id} className="bg-slate-900/60 p-3 rounded border border-slate-800 text-sm">
                            <p className="text-slate-300">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write an explanatory answer..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}