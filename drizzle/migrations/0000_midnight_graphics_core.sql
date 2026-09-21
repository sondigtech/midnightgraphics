-- ROLES ---------------------------------------------------------------
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create table public.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);
grant all on public.admin_allowlist to service_role;
alter table public.admin_allowlist enable row level security;
insert into public.admin_allowlist (email) values ('sonibrahimdigtech@gmail.com');

-- Lets an allowlisted signed-in user claim the admin role (no plaintext password anywhere)
create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  select exists (select 1 from public.admin_allowlist a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email',''))) into ok;
  if ok then
    insert into public.user_roles (user_id, role) values (auth.uid(), 'admin') on conflict do nothing;
  end if;
  return ok;
end $$;
grant execute on function public.claim_admin() to authenticated;

-- SERVICES ------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_sw text,
  description_en text,
  description_sw text,
  icon text default 'Sparkles',
  price_from numeric,
  currency text default 'TZS',
  image_url text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "public read services" on public.services for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write services" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PACKAGES ------------------------------------------------------------
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_sw text,
  description_en text,
  description_sw text,
  price numeric,
  currency text default 'TZS',
  features_en text[] default '{}',
  features_sw text[] default '{}',
  image_url text,
  popular boolean not null default false,
  cta_text text,
  available boolean not null default true,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.packages to anon;
grant select, insert, update, delete on public.packages to authenticated;
grant all on public.packages to service_role;
alter table public.packages enable row level security;
create policy "public read packages" on public.packages for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write packages" on public.packages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PORTFOLIO -----------------------------------------------------------
create table public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Other',
  description_en text,
  description_sw text,
  client text,
  project_date date,
  project_url text,
  video_url text,
  cover_url text,
  images jsonb not null default '[]'::jsonb,
  tools text[] default '{}',
  published boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.portfolio to anon;
grant select, insert, update, delete on public.portfolio to authenticated;
grant all on public.portfolio to service_role;
alter table public.portfolio enable row level security;
create policy "public read portfolio" on public.portfolio for select to anon, authenticated using ((published and deleted_at is null) or public.has_role(auth.uid(),'admin'));
create policy "admin write portfolio" on public.portfolio for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- TESTIMONIALS --------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company text,
  photo_url text,
  quote_en text not null,
  quote_sw text,
  rating integer,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "public read testimonials" on public.testimonials for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write testimonials" on public.testimonials for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SERVICE REQUESTS ----------------------------------------------------
create type public.request_status as enum ('new','contacted','in_progress','completed','cancelled');

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  service text,
  description text,
  budget text,
  deadline date,
  company text,
  extra_info text,
  attachment_url text,
  status public.request_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now()
);
grant insert on public.service_requests to anon;
grant select, insert, update, delete on public.service_requests to authenticated;
grant all on public.service_requests to service_role;
alter table public.service_requests enable row level security;
create policy "anyone can submit request" on public.service_requests for insert to anon, authenticated with check (true);
create policy "admin manage requests" on public.service_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update requests" on public.service_requests for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete requests" on public.service_requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- CONTACT MESSAGES ----------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone can send message" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update messages" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- SITE SETTINGS (single row) ------------------------------------------
create table public.site_settings (
  id integer primary key default 1,
  company_name text not null default 'Midnight Graphics Enterprises',
  tagline_en text default 'Graphic Designer • Digital Creator • Creative Technology',
  tagline_sw text default 'Mchoraji wa Grafiti • Muundaji wa Kidijitali • Teknolojia ya Ubunifu',
  hero_title_en text default 'Creative Design. Digital Innovation. Limitless Possibilities.',
  hero_title_sw text default 'Ubunifu wa Kisanii. Uvumbuzi wa Kidijitali. Uwezekano Usio na Mipaka.',
  hero_subtitle_en text default 'Midnight Graphics Enterprises is a creative design and digital technology company delivering professional graphic design, printing, digital content, software development and app development solutions.',
  hero_subtitle_sw text default 'Midnight Graphics Enterprises ni kampuni ya ubunifu na teknolojia ya kidijitali inayotoa huduma za usanifu wa grafiti, uchapishaji, maudhui ya kidijitali, ukuzaji wa programu na utengenezaji wa apps.',
  about_en text default 'Midnight Graphics Enterprises is a creative and digital technology brand focused on transforming ideas into powerful visual experiences, digital products and practical technology solutions.',
  about_sw text default 'Midnight Graphics Enterprises ni brandi ya ubunifu na teknolojia ya kidijitali inayolenga kubadilisha mawazo kuwa matumizi ya kuona yenye nguvu, bidhaa za kidijitali na suluhisho halisi za teknolojia.',
  stat_projects text default '100+',
  stat_clients text default '50+',
  stat_services text default '28',
  stat_years text default '5+',
  email text default 'midnightgraphics300@gmail.com',
  whatsapp text default '255775057780',
  instagram text default 'https://www.instagram.com/official.midnight_graphics/',
  tiktok text default 'https://www.tiktok.com/@midnightgraphics',
  address text default 'Tanzania',
  business_hours text default 'Mon - Sat, 08:00 - 20:00 EAT',
  seo_title text default 'Midnight Graphics Enterprises | Graphic Design & Digital Solutions',
  seo_description text default 'Midnight Graphics Enterprises provides professional graphic design, branding, printing, digital content, software development, website development and mobile app solutions.',
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin write settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings (id) values (1);

-- CEO PROFILE ---------------------------------------------------------
create table public.ceo_profile (
  id integer primary key default 1,
  name text not null default 'Hamidu Ibrahim',
  position_en text default 'Founder / CEO / Graphic Designer / Digital Creator',
  position_sw text default 'Mwanzilishi / Mkurugenzi Mtendaji / Mchoraji wa Grafiti / Muundaji wa Kidijitali',
  bio_en text default '[Placeholder] Professional biography for Hamidu Ibrahim will appear here. Update it from the admin dashboard.',
  bio_sw text default '[Nafasi ya maandishi] Wasifu wa kitaalamu wa Hamidu Ibrahim utaonekana hapa. Ubadilishe kutoka kwenye dashibodi ya usimamizi.',
  philosophy_en text default '[Placeholder] Creative philosophy.',
  philosophy_sw text default '[Nafasi ya maandishi] Falsafa ya ubunifu.',
  skills text[] default '{}',
  experience_en text default '[Placeholder] Experience summary.',
  experience_sw text default '[Nafasi ya maandishi] Muhtasari wa uzoefu.',
  photo_url text,
  cv_url text,
  updated_at timestamptz not null default now(),
  constraint single_row_ceo check (id = 1)
);
grant select on public.ceo_profile to anon;
grant select, insert, update on public.ceo_profile to authenticated;
grant all on public.ceo_profile to service_role;
alter table public.ceo_profile enable row level security;
create policy "public read ceo" on public.ceo_profile for select to anon, authenticated using (true);
create policy "admin write ceo" on public.ceo_profile for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.ceo_profile (id) values (1);

-- STORAGE POLICIES ----------------------------------------------------
create policy "media readable" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "admin upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "admin update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "public upload attachments" on storage.objects for insert to anon, authenticated with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'attachments');