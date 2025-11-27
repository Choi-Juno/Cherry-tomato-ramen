-- Migration: 005_update_signup_trigger.sql
-- Update signup process to handle birth_year

-- 1. Update existing users to have birth_year = 2005 (approx 20 years old in 2025) if NULL
UPDATE public.users 
SET birth_year = 2005 
WHERE birth_year IS NULL;

-- 2. Update the trigger function to include birth_year from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, birth_year)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CAST(NEW.raw_user_meta_data->>'birth_year' AS INTEGER)
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

