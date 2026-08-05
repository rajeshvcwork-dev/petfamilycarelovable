ALTER TABLE public.subscription_plans ADD COLUMN trial_days integer NOT NULL DEFAULT 7;
ALTER TABLE public.subscribers ADD COLUMN trial_ends_at timestamptz;