ALTER TABLE public.orders
  ADD COLUMN birth_time text,
  ADD COLUMN birth_time_unknown boolean NOT NULL DEFAULT false,
  ADD COLUMN birth_place_name text,
  ADD COLUMN birth_lat double precision,
  ADD COLUMN birth_lng double precision;
