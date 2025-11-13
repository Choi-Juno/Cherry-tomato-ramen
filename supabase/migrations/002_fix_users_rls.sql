-- Fix RLS policies for users table to allow profile creation during signup

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile during signup" ON public.users;

-- Create a new INSERT policy that allows users to create their own profile
-- This works during signup because auth.uid() will match the new user's ID
CREATE POLICY "Enable insert for authenticated users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also ensure the SELECT policy exists for users to read their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

CREATE POLICY "Enable select for users based on user_id"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure UPDATE policy exists
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Enable update for users based on user_id"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Optional: Allow anon users to INSERT during signup (less secure but more flexible)
-- Uncomment if the above doesn't work
-- CREATE POLICY "Enable insert for anon during signup"
-- ON public.users
-- FOR INSERT
-- TO anon
-- WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

