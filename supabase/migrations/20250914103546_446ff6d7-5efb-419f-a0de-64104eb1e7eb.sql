-- Remove the safe_contact_info view entirely to resolve security definer issue

DROP VIEW IF EXISTS public.safe_contact_info CASCADE;

-- The table already has proper RLS policies, so the view is not necessary
-- Users should access contact info through the secure functions instead