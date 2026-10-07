ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS preview_url text;
CREATE OR REPLACE FUNCTION public.get_tutorial_video(_id uuid)
RETURNS TABLE (video_url text, full_access boolean, preview_seconds integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH a AS (SELECT (auth.uid() IS NOT NULL AND (public.has_active_subscription(auth.uid()) OR public.has_role(auth.uid(),'admin'))) AS ok)
  SELECT CASE WHEN a.ok THEN t.video_url ELSE coalesce(t.preview_url, t.video_url) END, a.ok, t.preview_seconds
  FROM public.tutorials t, a WHERE t.id = _id AND t.published
$$;