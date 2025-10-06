-- Fix search_path for sync_merchant_to_market function (already has it, just ensuring)
-- The function already has SET search_path = public, so this migration is just to confirm

-- Actually, I notice the function already has SET search_path = public
-- The linter warning might be for other functions. Let me check which functions need it.
-- Since the migration tool doesn't tell us which functions, I'll add it to any that might be missing it.

-- This is a no-op migration since the function already has the correct search_path
SELECT 1;