CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  entity_label text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_log_created_idx ON public.activity_log (created_at DESC);
CREATE INDEX activity_log_user_idx ON public.activity_log (user_email);
GRANT SELECT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read activity" ON public.activity_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r jsonb; o jsonb; act text; lbl text; changed text[]; det jsonb := '{}'::jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN r := to_jsonb(OLD); ELSE r := to_jsonb(NEW); END IF;
  lbl := coalesce(r->>'title', r->>'name_en', r->>'full_name', r->>'company_name', r->>'name', r->>'id');
  IF TG_OP = 'INSERT' THEN act := 'created';
  ELSIF TG_OP = 'DELETE' THEN act := 'deleted';
  ELSE
    o := to_jsonb(OLD);
    SELECT array_agg(k) INTO changed FROM jsonb_object_keys(r) k
      WHERE k NOT IN ('updated_at') AND (r->k) IS DISTINCT FROM (o->k);
    IF changed IS NULL THEN RETURN NEW; END IF;
    IF TG_TABLE_NAME = 'service_requests' THEN
      IF NOT ('status' = ANY(changed)) THEN RETURN NEW; END IF;
      act := 'status_changed';
      det := jsonb_build_object('from', o->>'status', 'to', r->>'status');
    ELSIF 'deleted_at' = ANY(changed) AND r->>'deleted_at' IS NOT NULL THEN act := 'deleted';
    ELSIF changed = ARRAY['published'] THEN act := CASE WHEN (r->>'published')::boolean THEN 'published' ELSE 'unpublished' END;
    ELSIF changed = ARRAY['sort_order'] THEN act := 'reordered';
    ELSE act := 'updated'; det := jsonb_build_object('fields', to_jsonb(changed));
    END IF;
  END IF;
  INSERT INTO public.activity_log (user_id, user_email, action, entity, entity_id, entity_label, details)
  VALUES (auth.uid(), auth.jwt()->>'email', act, TG_TABLE_NAME, r->>'id', lbl, det);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_log_portfolio AFTER INSERT OR UPDATE OR DELETE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER trg_log_services AFTER INSERT OR UPDATE OR DELETE ON public.services FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER trg_log_packages AFTER INSERT OR UPDATE OR DELETE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER trg_log_settings AFTER INSERT OR UPDATE OR DELETE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER trg_log_ceo AFTER INSERT OR UPDATE OR DELETE ON public.ceo_profile FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER trg_log_requests AFTER UPDATE OR DELETE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.log_activity();
REVOKE EXECUTE ON FUNCTION public.log_activity() FROM PUBLIC, anon, authenticated;