-- Add is_deleted column for soft delete
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Create index for faster filtering of non-deleted items
CREATE INDEX IF NOT EXISTS idx_transactions_is_deleted ON public.transactions(is_deleted);

-- Update the view policy to exclude deleted transactions by default
-- Note: We might want to allow viewing them in a specific "Trash" view, 
-- but for now let's filter them out from the main view for safety.
-- However, modifying the existing policy is tricky without dropping it first.
-- A safer approach for now is to rely on the application layer query filtering 
-- and ensure RLS allows access so the owner can still "restore" it if we build that feature later.
-- So we will keep the RLS as is (access by user_id) and filter in the query.

