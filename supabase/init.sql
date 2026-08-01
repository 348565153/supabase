-- ============================================================
-- 博客论坛数据库初始化 SQL（幂等版本）
-- 在 Supabase SQL Editor 中执行此文件
-- 可重复执行，不会报错
-- ============================================================

-- 1. 用户资料表（如果不存在则创建；已存在则添加 role 字段）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- 为旧表添加 role 字段
alter table public.profiles
  add column if not exists role text default 'user' check (role in ('user', 'admin'));

-- 2. 文章表
create table if not exists public.posts (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  category text,
  created_at timestamp with time zone default now()
);

-- 3. 评论表
create table if not exists public.comments (
  id bigint primary key generated always as identity,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- 4. 索引
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_posts_user_id on public.posts(user_id);

-- 5. RLS（行级安全）策略
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- 删除旧策略（幂等）
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "posts_select" on public.posts;
drop policy if exists "posts_insert" on public.posts;
drop policy if exists "posts_update" on public.posts;
drop policy if exists "posts_delete" on public.posts;
drop policy if exists "comments_select" on public.comments;
drop policy if exists "comments_insert" on public.comments;
drop policy if exists "comments_delete" on public.comments;

-- 重新创建策略
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_update" on public.posts for update using (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = user_id);

-- 6. 注册触发器：新用户注册时自动创建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_username text;
begin
  default_username := split_part(new.email, '@', 1);

  insert into public.profiles (id, username, role)
  values (
    new.id,
    default_username,
    case when new.email = '348565153@qq.com' then 'admin' else 'user' end
  )
  on conflict (id) do update set
    username = excluded.username,
    role = case when new.email = '348565153@qq.com' then 'admin' else public.profiles.role end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. 如果 348565153@qq.com 已经存在，强制更新为 admin
update public.profiles
set role = 'admin'
where id in (
  select id from auth.users where email = '348565153@qq.com'
);

-- 8. 启用 Realtime（评论实时推送）
alter publication supabase_realtime add table public.comments;

-- ✅ 完成！
