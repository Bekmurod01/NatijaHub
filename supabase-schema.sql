-- ================================================
-- NatijaHub — Supabase Database Schema
-- Supabase Dashboard > SQL Editor ga joylashtiring
-- ================================================

-- 1. PROFILES (talaba va tadbirkor profillari)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('student', 'company')) default 'student',
  university text,
  faculty text,
  phone text,
  about text,
  skills text[], -- ['HR', 'Excel', 'Marketing']
  company_name text, -- faqat tadbirkorlar uchun
  industry text,
  created_at timestamp with time zone default now()
);

-- 2. INTERNSHIPS (intership e'lonlari)
create table internships (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references profiles(id) on delete cascade,
  company_name text not null,
  company_logo text default '🏢',
  role text not null,
  description text,
  skills text[],
  duration text,
  type text check (type in ('Ofis', 'Remote', 'Gibrid')),
  faculty text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 3. APPLICATIONS (arizalar)
create table applications (
  id uuid default gen_random_uuid() primary key,
  internship_id uuid references internships(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default now(),
  unique(internship_id, student_id)
);

-- 4. EXPERIENCES (tugallangan amaliyotlar — CV uchun)
create table experiences (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  company_name text not null,
  company_logo text default '🏢',
  role text not null,
  duration text,
  period text,
  tasks text[],
  skills text[],
  rating numeric(2,1),
  stars integer check (stars between 1 and 5),
  recommendation text,
  reviewer_name text,
  created_at timestamp with time zone default now()
);

-- ================================================
-- ROW LEVEL SECURITY (RLS) — Xavfsizlik
-- ================================================

alter table profiles enable row level security;
alter table internships enable row level security;
alter table applications enable row level security;
alter table experiences enable row level security;

-- Profiles: faqat o'z profilini ko'ra/o'zgartira oladi
create policy "Profil ko'rish" on profiles for select using (true);
create policy "Profil yaratish" on profiles for insert with check (auth.uid() = id);
create policy "Profil tahrirlash" on profiles for update using (auth.uid() = id);

-- Internships: hamma ko'radi, faqat egasi o'zgartiradi
create policy "Intership ko'rish" on internships for select using (true);
create policy "Intership yaratish" on internships for insert with check (auth.uid() = company_id);
create policy "Intership tahrirlash" on internships for update using (auth.uid() = company_id);

-- Applications: faqat o'z arizasini ko'radi
create policy "Ariza ko'rish" on applications for select using (auth.uid() = student_id);
create policy "Ariza berish" on applications for insert with check (auth.uid() = student_id);

-- Experiences: faqat o'z tajribasini ko'radi
create policy "Tajriba ko'rish" on experiences for select using (auth.uid() = student_id);

-- ================================================
-- TRIGGER: yangi user ro'yxatdan o'tganda profil yaratadi
-- ================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ================================================
-- NAMUNAVIY MA'LUMOTLAR (ixtiyoriy)
-- ================================================

-- Test uchun namunaviy intershplar (company_id ni haqiqiy UUID ga almashtiring)
-- insert into internships (company_id, company_name, company_logo, role, description, skills, duration, type, faculty)
-- values 
--   ('your-uuid', 'Shiraq Business School', '🏫', 'HR Assistant Intern', 'Kadrlar bo''limida yordam', ARRAY['HR','Recruitment'], '2 oy', 'Ofis', 'BA'),
--   ('your-uuid', 'Tasweer Academy', '📸', 'Marketing Intern', 'SMM va kontent', ARRAY['SMM','Canva'], '3 oy', 'Gibrid', 'Marketing');