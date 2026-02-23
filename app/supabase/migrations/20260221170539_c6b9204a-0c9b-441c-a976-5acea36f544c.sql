-- Update check constraint to include 'video' type
ALTER TABLE public.lessons DROP CONSTRAINT lessons_type_check;
ALTER TABLE public.lessons ADD CONSTRAINT lessons_type_check CHECK (type = ANY (ARRAY['content'::text, 'challenge'::text, 'video'::text]));