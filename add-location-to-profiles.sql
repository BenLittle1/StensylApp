-- Add location column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location TEXT;

-- You can optionally backfill some data for existing users
-- UPDATE public.profiles
-- SET location = 'Kingston, Ontario' -- Example location
-- WHERE id = 'your-user-id'; -- Specify the user to update 