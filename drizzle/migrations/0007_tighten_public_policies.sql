DROP POLICY IF EXISTS "public read settings" ON public.site_settings;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (id = 1);

DROP POLICY IF EXISTS "anyone can submit request" ON public.service_requests;
CREATE POLICY "anyone can submit request" ON public.service_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new' AND admin_notes IS NULL AND client_response IS NULL AND response_id IS NULL
  AND length(full_name) BETWEEN 2 AND 200 AND length(email) BETWEEN 3 AND 320 AND email LIKE '%@%'
  AND coalesce(length(description),0) <= 5000 AND coalesce(length(extra_info),0) <= 5000
  AND coalesce(length(phone),0) <= 40 AND coalesce(length(whatsapp),0) <= 40
  AND coalesce(length(budget),0) <= 200 AND coalesce(length(company),0) <= 200
  AND coalesce(length(service),0) <= 200 AND coalesce(length(attachment_url),0) <= 1000
);

DROP POLICY IF EXISTS "anyone can send message" ON public.contact_messages;
CREATE POLICY "anyone can send message" ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  is_read = false AND length(name) BETWEEN 2 AND 200 AND length(email) BETWEEN 3 AND 320 AND email LIKE '%@%'
  AND length(message) BETWEEN 1 AND 5000 AND coalesce(length(phone),0) <= 40 AND coalesce(length(subject),0) <= 300
);

DROP POLICY IF EXISTS "media readable" ON storage.objects;
CREATE POLICY "admin read media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "public upload attachments" ON storage.objects;