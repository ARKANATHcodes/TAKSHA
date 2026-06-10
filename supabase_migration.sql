-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tag TEXT DEFAULT 'General' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post_votes table
CREATE TABLE IF NOT EXISTS public.post_votes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Enable Row Level Security (RLS) on tables (standard Supabase best practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

-- Set up basic access policies (read-all, write-authenticated)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);


CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert posts" 
ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts FOR DELETE USING (auth.uid() = user_id);


CREATE POLICY "Public comments are viewable by everyone" 
ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" 
ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE USING (auth.uid() = user_id);


CREATE POLICY "Public post votes are viewable by everyone" 
ON public.post_votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert votes" 
ON public.post_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.post_votes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.post_votes FOR DELETE USING (auth.uid() = user_id);


-- Create trigger to update posts upvotes count on vote insert/update/delete
CREATE OR REPLACE FUNCTION public.handle_post_vote()
RETURNS trigger AS $$
DECLARE
  vote_diff INTEGER := 0;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    vote_diff := CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END;
  ELSIF (TG_OP = 'UPDATE') THEN
    vote_diff := CASE 
      WHEN OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN -2
      WHEN OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN 2
      ELSE 0
    END;
  ELSIF (TG_OP = 'DELETE') THEN
    vote_diff := CASE WHEN OLD.vote_type = 'up' THEN -1 ELSE 1 END;
  END IF;

  UPDATE public.posts
  SET upvotes = upvotes + vote_diff
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_vote_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_vote();


-- Create trigger to automatically insert a profile upvote for new posts
CREATE OR REPLACE FUNCTION public.handle_new_post_vote()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.post_votes (post_id, user_id, vote_type)
  VALUES (NEW.id, NEW.user_id, 'up')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_post_vote();



-- Optional: Create a trigger that automatically inserts a profile record when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime subscriptions for forum tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_votes;
