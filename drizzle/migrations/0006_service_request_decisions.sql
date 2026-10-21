ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS client_response text;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS response_id uuid;
COMMENT ON COLUMN public.service_requests.client_response IS 'Client-facing explanation of the admin decision; never internal admin notes.';
COMMENT ON COLUMN public.service_requests.response_id IS 'Unique identifier of the current admin response event.';