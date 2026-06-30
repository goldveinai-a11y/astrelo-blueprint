CREATE TABLE public.quiz_tokens (
  token text PRIMARY KEY,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.quiz_tokens TO service_role;
ALTER TABLE public.quiz_tokens ENABLE ROW LEVEL SECURITY;
CREATE INDEX quiz_tokens_created_at_idx ON public.quiz_tokens(created_at);