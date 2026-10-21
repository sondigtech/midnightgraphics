CREATE TABLE public.tutorial_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tutorial_id uuid NOT NULL,
  position_seconds numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tutorial_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutorial_progress TO authenticated;
GRANT ALL ON public.tutorial_progress TO service_role;
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress read" ON public.tutorial_progress FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own progress insert" ON public.tutorial_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress update" ON public.tutorial_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress delete" ON public.tutorial_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);