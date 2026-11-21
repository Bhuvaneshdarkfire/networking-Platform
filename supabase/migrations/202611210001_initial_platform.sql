-- Community Networking Platform: initial Supabase schema
-- Run once in Supabase SQL Editor, or apply with: npx supabase db push

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 40),
  name text not null default '',
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 500),
  location text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.profile_interests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, interest_id)
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  category text not null default 'General',
  cover_url text,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'moderator', 'member')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 5000),
  media_url text,
  media_path text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(body)) > 0 or media_url is not null)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.bookmarks (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);

create unique index connections_unique_pair_idx
  on public.connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'connection', 'community')),
  resource_id uuid,
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Performance indexes
-- ---------------------------------------------------------------------------

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_id_idx on public.posts (author_id, created_at desc);
create index posts_community_id_idx on public.posts (community_id, created_at desc);
create index comments_post_id_idx on public.comments (post_id, created_at);
create index community_members_user_id_idx on public.community_members (user_id);
create index notifications_recipient_idx on public.notifications (recipient_id, read, created_at desc);

-- ---------------------------------------------------------------------------
-- Shared trigger functions
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger communities_set_updated_at before update on public.communities
for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();
create trigger comments_set_updated_at before update on public.comments
for each row execute function public.set_updated_at();
create trigger connections_set_updated_at before update on public.connections
for each row execute function public.set_updated_at();

-- Automatically create a profile after Supabase Auth signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_username text;
begin
  generated_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, 'member'), '@', 1), 'member'),
    '[^a-zA-Z0-9_]', '', 'g'
  )) || '_' || substr(new.id::text, 1, 6);

  insert into public.profiles (id, username, name)
  values (
    new.id,
    generated_username,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'Member'), '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- A community owner is automatically added as its first member.
create or replace function public.add_community_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.community_members (community_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (community_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

create trigger on_community_created
after insert on public.communities
for each row execute function public.add_community_owner();

create or replace function public.is_community_member(target_community_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.community_members
    where community_id = target_community_id and user_id = target_user_id
  );
$$;

-- Notification triggers for likes and comments.
create or replace function public.notify_post_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, resource_id, message)
  select author_id, new.user_id, 'like', new.post_id, 'liked your post'
  from public.posts
  where id = new.post_id and author_id <> new.user_id;
  return new;
end;
$$;

create trigger on_post_liked
after insert on public.post_likes
for each row execute function public.notify_post_like();

create or replace function public.notify_post_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, resource_id, message)
  select author_id, new.author_id, 'comment', new.post_id, 'commented on your post'
  from public.posts
  where id = new.post_id and author_id <> new.author_id;
  return new;
end;
$$;

create trigger on_post_commented
after insert on public.comments
for each row execute function public.notify_post_comment();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.profile_interests enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.connections enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users update their own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Interests are publicly readable" on public.interests for select using (true);
create policy "Profile interests are publicly readable" on public.profile_interests for select using (true);
create policy "Users add their own interests" on public.profile_interests for insert to authenticated
  with check ((select auth.uid()) = profile_id);
create policy "Users remove their own interests" on public.profile_interests for delete to authenticated
  using ((select auth.uid()) = profile_id);

create policy "Communities are publicly readable" on public.communities for select using (true);
create policy "Authenticated users create communities" on public.communities for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "Owners update communities" on public.communities for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Owners delete communities" on public.communities for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Memberships are publicly readable" on public.community_members for select using (true);
create policy "Users join communities as themselves" on public.community_members for insert to authenticated
  with check ((select auth.uid()) = user_id and role = 'member');
create policy "Users leave communities" on public.community_members for delete to authenticated
  using ((select auth.uid()) = user_id and role <> 'owner');
create policy "Owners manage member roles" on public.community_members for update to authenticated
  using (exists (
    select 1 from public.communities c
    where c.id = community_id and c.owner_id = (select auth.uid())
  ));

create policy "Posts are publicly readable" on public.posts for select using (true);
create policy "Authenticated users create posts" on public.posts for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and (community_id is null or public.is_community_member(community_id, (select auth.uid())))
  );
create policy "Authors update their posts" on public.posts for update to authenticated
  using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
create policy "Authors delete their posts" on public.posts for delete to authenticated
  using ((select auth.uid()) = author_id);

create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Authenticated users create comments" on public.comments for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy "Authors update their comments" on public.comments for update to authenticated
  using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
create policy "Authors delete their comments" on public.comments for delete to authenticated
  using ((select auth.uid()) = author_id);

create policy "Likes are publicly readable" on public.post_likes for select using (true);
create policy "Users like as themselves" on public.post_likes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users remove their likes" on public.post_likes for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read their bookmarks" on public.bookmarks for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users create their bookmarks" on public.bookmarks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users delete their bookmarks" on public.bookmarks for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Connection participants can read" on public.connections for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));
create policy "Users send connection requests" on public.connections for insert to authenticated
  with check ((select auth.uid()) = requester_id and status = 'pending');
create policy "Connection participants can update" on public.connections for update to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id))
  with check ((select auth.uid()) in (requester_id, addressee_id));
create policy "Connection participants can delete" on public.connections for delete to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create policy "Users read their notifications" on public.notifications for select to authenticated
  using ((select auth.uid()) = recipient_id);
create policy "Users mark their notifications read" on public.notifications for update to authenticated
  using ((select auth.uid()) = recipient_id) with check ((select auth.uid()) = recipient_id);
create policy "Users delete their notifications" on public.notifications for delete to authenticated
  using ((select auth.uid()) = recipient_id);

-- ---------------------------------------------------------------------------
-- Storage buckets and object policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media', 'post-media', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public media is readable" on storage.objects for select
  using (bucket_id in ('post-media', 'avatars'));
create policy "Users upload to their media folder" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('post-media', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users update their media" on storage.objects for update to authenticated
  using (
    bucket_id in ('post-media', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users delete their media" on storage.objects for delete to authenticated
  using (
    bucket_id in ('post-media', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------------
-- Seed data, grants, and Realtime
-- ---------------------------------------------------------------------------

insert into public.interests (name) values
  ('Technology'), ('Design'), ('Education'), ('Sustainability'),
  ('Outdoors'), ('Arts'), ('Wellness'), ('Volunteering')
on conflict (name) do nothing;

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

revoke all on function public.is_community_member(uuid, uuid) from public;
grant execute on function public.is_community_member(uuid, uuid) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments') then
    alter publication supabase_realtime add table public.comments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
