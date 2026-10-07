ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tutorial_monthly_price numeric NOT NULL DEFAULT 50000;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_instructions text DEFAULT 'Pay via Mobile Money (M-Pesa, Tigo Pesa, Airtel Money) then enter the transaction reference below. Contact us on WhatsApp for the payment number.';

CREATE TABLE public.tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'Graphic Design',
  thumbnail_url text,
  video_url text,
  preview_seconds integer NOT NULL DEFAULT 59,
  duration text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutorials TO authenticated;
GRANT ALL ON public.tutorials TO service_role;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage tutorials" ON public.tutorials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.student_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  full_name text,
  phone text,
  payment_method text,
  payment_reference text NOT NULL,
  amount numeric,
  currency text NOT NULL DEFAULT 'TZS',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rejected','expired')),
  activated_at timestamptz,
  expires_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_subscriptions TO authenticated;
GRANT ALL ON public.student_subscriptions TO service_role;
ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student read own subs" ON public.student_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "student create own sub" ON public.student_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "admin update subs" ON public.student_subscriptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete subs" ON public.student_subscriptions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.subs_before_write() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.amount := (SELECT coalesce(tutorial_monthly_price, 50000) FROM public.site_settings WHERE id = 1);
    IF NEW.amount IS NULL THEN NEW.amount := 50000; END IF;
    NEW.status := 'pending'; NEW.activated_at := NULL; NEW.expires_at := NULL;
    NEW.user_email := auth.jwt() ->> 'email';
  ELSE
    IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
      NEW.activated_at := now();
      NEW.expires_at := greatest(now(), coalesce((SELECT max(expires_at) FROM public.student_subscriptions s WHERE s.user_id = NEW.user_id AND s.status = 'active' AND s.id <> NEW.id), now())) + interval '30 days';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_subs_before BEFORE INSERT OR UPDATE ON public.student_subscriptions FOR EACH ROW EXECUTE FUNCTION public.subs_before_write();

CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT exists (SELECT 1 FROM public.student_subscriptions WHERE user_id = _user_id AND status = 'active' AND expires_at > now())
$$;

CREATE OR REPLACE FUNCTION public.list_tutorials()
RETURNS TABLE (id uuid, title text, description text, category text, thumbnail_url text, preview_seconds integer, duration text, sort_order integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, title, description, category, thumbnail_url, preview_seconds, duration, sort_order
  FROM public.tutorials WHERE published ORDER BY sort_order, created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.get_tutorial_video(_id uuid)
RETURNS TABLE (video_url text, full_access boolean, preview_seconds integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.video_url,
    (auth.uid() IS NOT NULL AND (public.has_active_subscription(auth.uid()) OR public.has_role(auth.uid(),'admin'))),
    t.preview_seconds
  FROM public.tutorials t WHERE t.id = _id AND t.published
$$;
GRANT EXECUTE ON FUNCTION public.list_tutorials() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tutorial_video(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO authenticated;