ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS pricing_type text NOT NULL DEFAULT 'STARTING_FROM';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.packages ADD CONSTRAINT packages_pricing_type_check CHECK (pricing_type IN ('STARTING_FROM','FIXED','CONTACT_FOR_QUOTE'));
CREATE UNIQUE INDEX IF NOT EXISTS packages_slug_key ON public.packages (slug) WHERE slug IS NOT NULL;
UPDATE public.packages SET slug = lower(regexp_replace(name_en, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;