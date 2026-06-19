-- ============================================================
-- SkillSpring LMS – Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Profiles (mirrors auth.users, stores role)
create table if not exists public.profiles (
  id   uuid references auth.users (id) on delete cascade primary key,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper to check admin role without triggering recursive RLS policy evaluation.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Users can read their own profile; admins can read all
drop policy if exists "profiles: own read" on public.profiles;
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: admin read all" on public.profiles;
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Courses
create table if not exists public.courses (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  name                 text not null,
  tagline              text not null default '',
  description          text not null default '',
  description_detailed text not null default '',
  price                numeric(10, 2) not null default 0,
  compare_at_price     numeric(10, 2) not null default 0,
  category             text not null default '',
  rating               numeric(3, 1) not null default 0,
  review_count         int not null default 0,
  downloads            text not null default '',
  modules              jsonb not null default '[]',
  accent               text not null default '',
  included             jsonb not null default '[]',
  outcomes             jsonb not null default '[]',
  published            boolean not null default true,
  created_at           timestamptz not null default now()
);

alter table public.courses enable row level security;

-- Public read: anonymous and authenticated users can read published courses.
drop policy if exists "courses: authenticated read" on public.courses;
drop policy if exists "courses: public read published" on public.courses;
create policy "courses: public read published"
  on public.courses for select
  using (published = true);

-- Admins can read all (including unpublished)
drop policy if exists "courses: admin read all" on public.courses;
create policy "courses: admin read all"
  on public.courses for select
  using (public.is_admin());

-- Only admins can insert / update / delete
drop policy if exists "courses: admin insert" on public.courses;
create policy "courses: admin insert"
  on public.courses for insert
  with check (public.is_admin());

drop policy if exists "courses: admin update" on public.courses;
create policy "courses: admin update"
  on public.courses for update
  using (public.is_admin());

drop policy if exists "courses: admin delete" on public.courses;
create policy "courses: admin delete"
  on public.courses for delete
  using (public.is_admin());


-- 3. Enrollments
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade not null,
  course_id   uuid references public.courses (id) on delete cascade not null,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;

-- Users can read and insert their own enrollments
drop policy if exists "enrollments: own read" on public.enrollments;
create policy "enrollments: own read"
  on public.enrollments for select
  using (auth.uid() = user_id);

drop policy if exists "enrollments: own insert" on public.enrollments;
create policy "enrollments: own insert"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

-- Admins can read all enrollments
drop policy if exists "enrollments: admin read all" on public.enrollments;
create policy "enrollments: admin read all"
  on public.enrollments for select
  using (public.is_admin());


-- 4. Pending Purchases (guest checkout)
create table if not exists public.pending_purchases (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  course_slug        text references public.courses (slug) on delete cascade not null,
  stripe_session_id  text not null,
  purchase_method    text not null default 'unknown',
  claimed            boolean not null default false,
  claimed_by_user_id uuid references auth.users (id) on delete set null,
  claimed_at         timestamptz,
  created_at         timestamptz not null default now(),
  unique (stripe_session_id, course_slug)
);

create index if not exists pending_purchases_email_claimed_idx
  on public.pending_purchases (email, claimed);

alter table public.pending_purchases enable row level security;


-- 5. LMS Modules
create table if not exists public.course_modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references public.courses (id) on delete cascade not null,
  title       text not null,
  description text not null default '',
  position    int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (course_id, position)
);

create index if not exists course_modules_course_idx
  on public.course_modules (course_id, position);

alter table public.course_modules enable row level security;

drop policy if exists "course_modules: admin read all" on public.course_modules;
create policy "course_modules: admin read all"
  on public.course_modules for select
  using (public.is_admin());

drop policy if exists "course_modules: enrolled read" on public.course_modules;
create policy "course_modules: enrolled read"
  on public.course_modules for select
  using (
    published = true
    and exists (
      select 1
      from public.courses c
      where c.id = course_id
        and c.published = true
    )
    and exists (
      select 1
      from public.enrollments e
      where e.course_id = course_id
        and e.user_id = auth.uid()
    )
  );

drop policy if exists "course_modules: admin insert" on public.course_modules;
create policy "course_modules: admin insert"
  on public.course_modules for insert
  with check (public.is_admin());

drop policy if exists "course_modules: admin update" on public.course_modules;
create policy "course_modules: admin update"
  on public.course_modules for update
  using (public.is_admin());

drop policy if exists "course_modules: admin delete" on public.course_modules;
create policy "course_modules: admin delete"
  on public.course_modules for delete
  using (public.is_admin());


-- 6. LMS Lessons
create table if not exists public.module_lessons (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid references public.course_modules (id) on delete cascade not null,
  title            text not null,
  description      text not null default '',
  content_type     text not null check (content_type in ('video', 'pdf', 'both')),
  video_url        text,
  pdf_url          text,
  duration_seconds int not null default 0,
  position         int not null default 0,
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  unique (module_id, position)
);

alter table public.module_lessons
  drop constraint if exists module_lessons_check;

create index if not exists module_lessons_module_idx
  on public.module_lessons (module_id, position);

alter table public.module_lessons enable row level security;

drop policy if exists "module_lessons: admin read all" on public.module_lessons;
create policy "module_lessons: admin read all"
  on public.module_lessons for select
  using (public.is_admin());

drop policy if exists "module_lessons: enrolled read" on public.module_lessons;
create policy "module_lessons: enrolled read"
  on public.module_lessons for select
  using (
    published = true
    and exists (
      select 1
      from public.course_modules m
      join public.courses c on c.id = m.course_id
      join public.enrollments e on e.course_id = c.id
      where m.id = module_id
        and m.published = true
        and c.published = true
        and e.user_id = auth.uid()
    )
  );

drop policy if exists "module_lessons: admin insert" on public.module_lessons;
create policy "module_lessons: admin insert"
  on public.module_lessons for insert
  with check (public.is_admin());

drop policy if exists "module_lessons: admin update" on public.module_lessons;
create policy "module_lessons: admin update"
  on public.module_lessons for update
  using (public.is_admin());

drop policy if exists "module_lessons: admin delete" on public.module_lessons;
create policy "module_lessons: admin delete"
  on public.module_lessons for delete
  using (public.is_admin());


-- 7. Lesson Progress
create table if not exists public.lesson_progress (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete cascade not null,
  lesson_id      uuid references public.module_lessons (id) on delete cascade not null,
  completed      boolean not null default false,
  completed_at   timestamptz,
  last_viewed_at timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx
  on public.lesson_progress (user_id);

create index if not exists lesson_progress_lesson_idx
  on public.lesson_progress (lesson_id);

create or replace function public.touch_lesson_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lesson_progress_touch_updated_at on public.lesson_progress;
create trigger lesson_progress_touch_updated_at
  before update on public.lesson_progress
  for each row execute procedure public.touch_lesson_progress_updated_at();

alter table public.lesson_progress enable row level security;

drop policy if exists "lesson_progress: own read" on public.lesson_progress;
create policy "lesson_progress: own read"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "lesson_progress: own insert" on public.lesson_progress;
create policy "lesson_progress: own insert"
  on public.lesson_progress for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.module_lessons l
      join public.course_modules m on m.id = l.module_id
      join public.enrollments e on e.course_id = m.course_id
      where l.id = lesson_id
        and e.user_id = auth.uid()
    )
  );

drop policy if exists "lesson_progress: own update" on public.lesson_progress;
create policy "lesson_progress: own update"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

drop policy if exists "lesson_progress: admin read all" on public.lesson_progress;
create policy "lesson_progress: admin read all"
  on public.lesson_progress for select
  using (public.is_admin());


-- 8. Course Certificates
create table if not exists public.course_certificates (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users (id) on delete cascade not null,
  course_id          uuid references public.courses (id) on delete cascade not null,
  certificate_number text unique not null,
  issued_at          timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists course_certificates_user_idx
  on public.course_certificates (user_id, issued_at desc);

alter table public.course_certificates enable row level security;

drop policy if exists "course_certificates: own read" on public.course_certificates;
create policy "course_certificates: own read"
  on public.course_certificates for select
  using (auth.uid() = user_id);

drop policy if exists "course_certificates: own insert" on public.course_certificates;
create policy "course_certificates: own insert"
  on public.course_certificates for insert
  with check (auth.uid() = user_id);

drop policy if exists "course_certificates: admin read all" on public.course_certificates;
create policy "course_certificates: admin read all"
  on public.course_certificates for select
  using (public.is_admin());


-- ============================================================
-- To promote a user to admin, run:
--   update public.profiles set role = 'admin' where id = '<user-uuid>';
-- ============================================================
