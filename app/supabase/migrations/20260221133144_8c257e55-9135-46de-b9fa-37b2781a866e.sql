-- Add video_url column to lessons table
ALTER TABLE public.lessons ADD COLUMN video_url text DEFAULT NULL;