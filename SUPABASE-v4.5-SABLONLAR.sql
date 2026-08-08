-- MEDİKENT RAPORLAMA ASİSTANI v4.5
-- FAALİYET ŞABLONLARI

create table if not exists public.activity_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  activity_type text not null,
  report_topic text,
  platform text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.activity_templates enable row level security;

drop policy if exists "Aktif kullanicilar sablonlari gorebilir" on public.activity_templates;
drop policy if exists "Admin sablon ekleyebilir" on public.activity_templates;
drop policy if exists "Admin sablon duzenleyebilir" on public.activity_templates;
drop policy if exists "Admin sablon silebilir" on public.activity_templates;

create policy "Aktif kullanicilar sablonlari gorebilir"
on public.activity_templates for select to authenticated
using (public.is_active_user());

create policy "Admin sablon ekleyebilir"
on public.activity_templates for insert to authenticated
with check (public.current_user_role()='admin');

create policy "Admin sablon duzenleyebilir"
on public.activity_templates for update to authenticated
using (public.current_user_role()='admin')
with check (public.current_user_role()='admin');

create policy "Admin sablon silebilir"
on public.activity_templates for delete to authenticated
using (public.current_user_role()='admin');

insert into public.activity_templates(name,activity_type,report_topic,platform,active,sort_order)
values
('Gebe Okulu','Gebe Okulu','Gebe Okulu',null,true,10),
('Doktor Videosu','Video','Doktor Bilgilendirme','Instagram',true,20),
('Basın Haberi','Basın / Haber','Basın / Haber',null,true,30),
('Sağlık Taraması','Sağlık Taraması','Sağlık Taraması',null,true,40),
('Farkındalık Etkinliği','Farkındalık Etkinliği','Farkındalık Etkinliği',null,true,50)
on conflict (name) do nothing;
