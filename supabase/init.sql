-- ============================================================
-- 博客论坛数据库初始化 SQL
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- 1. 用户资料表
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default now()
);

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

-- profiles: 用户只能读写自己的资料
alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- posts: 所有人可读，登录用户可发帖，作者可编辑/删除自己的文章
alter table public.posts enable row level security;

create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_update" on public.posts for update using (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

-- comments: 所有人可读，登录用户可评论，作者可删除自己的评论
alter table public.comments enable row level security;

create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = user_id);

-- 6. 注册触发器：新用户注册时自动创建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. 启用 Realtime（评论实时推送）
alter publication supabase_realtime add table public.comments;

-- ✅ 完成！
