CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  amount_paise integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  period_days integer NOT NULL DEFAULT 30,
  pet_limit integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  mobile text NOT NULL DEFAULT '',
  plan_code text NOT NULL DEFAULT 'single',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX subscribers_email_key ON public.subscribers (lower(email));
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  mobile text NOT NULL DEFAULT '',
  plan_code text NOT NULL DEFAULT 'single',
  amount_paise integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  status text NOT NULL DEFAULT 'created',
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_attempts TO service_role;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER touch_subscription_plans BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_subscribers BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_payment_attempts BEFORE UPDATE ON public.payment_attempts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.subscription_plans (code, name, description, amount_paise, period_days, pet_limit)
VALUES
  ('single', 'Single Pet Plan', 'Maintain one pet profile with full health records and reminders.', 29900, 30, 1),
  ('family', 'Family Plan', 'Maintain up to four pet profiles with full health records and reminders.', 79900, 30, 4);