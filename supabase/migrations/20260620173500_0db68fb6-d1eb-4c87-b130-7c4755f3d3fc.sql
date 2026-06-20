
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  dob_day int NOT NULL,
  dob_month int NOT NULL,
  dob_year int NOT NULL,
  tier text NOT NULL CHECK (tier IN ('core','popular','ultimate')),
  partner_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  stripe_session_id text,
  generated_narrative jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
