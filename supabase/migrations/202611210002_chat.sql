-- Private direct messaging, realtime chat, and private file attachments.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  direct_key text unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 5000),
  attachment_path text,
  attachment_name text,
  attachment_type text,
  created_at timestamptz not null default now(),
  check (char_length(trim(body)) > 0 or attachment_path is not null)
);

create index conversation_members_user_idx on public.conversation_members (user_id, conversation_id);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

create or replace function public.is_conversation_member(target_conversation_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = target_conversation_id and user_id = target_user_id
  );
$$;

-- Atomically finds or starts one direct conversation for a pair of users.
create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  pair_key text;
  result_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if current_user_id = other_user_id then
    raise exception 'Cannot start a conversation with yourself';
  end if;
  if not exists (select 1 from public.profiles where id = other_user_id) then
    raise exception 'Profile not found';
  end if;

  pair_key := least(current_user_id::text, other_user_id::text) || ':' || greatest(current_user_id::text, other_user_id::text);

  insert into public.conversations (direct_key, created_by)
  values (pair_key, current_user_id)
  on conflict (direct_key) do update set direct_key = excluded.direct_key
  returning id into result_id;

  insert into public.conversation_members (conversation_id, user_id)
  values (result_id, current_user_id), (result_id, other_user_id)
  on conflict do nothing;

  return result_id;
end;
$$;

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_created
after insert on public.messages
for each row execute function public.touch_conversation_on_message();

create or replace function public.notify_connection_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (recipient_id, actor_id, type, resource_id, message)
    values (new.addressee_id, new.requester_id, 'connection', new.id, 'sent you a connection request');
  elsif old.status = 'pending' and new.status = 'accepted' then
    insert into public.notifications (recipient_id, actor_id, type, resource_id, message)
    values (new.requester_id, new.addressee_id, 'connection', new.id, 'accepted your connection request');
  end if;
  return new;
end;
$$;

create trigger on_connection_changed
after insert or update on public.connections
for each row execute function public.notify_connection_change();

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy "Members read conversations" on public.conversations for select to authenticated
  using (public.is_conversation_member(id, (select auth.uid())));
create policy "Members update conversations" on public.conversations for update to authenticated
  using (public.is_conversation_member(id, (select auth.uid())));

create policy "Members read conversation participants" on public.conversation_members for select to authenticated
  using (public.is_conversation_member(conversation_id, (select auth.uid())));
create policy "Members update their read state" on public.conversation_members for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Members read messages" on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id, (select auth.uid())));
create policy "Members send messages" on public.messages for insert to authenticated
  with check (
    (select auth.uid()) = sender_id
    and public.is_conversation_member(conversation_id, (select auth.uid()))
  );
create policy "Senders delete messages" on public.messages for delete to authenticated
  using ((select auth.uid()) = sender_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-files', 'chat-files', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Members read chat files" on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-files'
    and public.is_conversation_member(((storage.foldername(name))[1])::uuid, (select auth.uid()))
  );
create policy "Members upload chat files" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-files'
    and public.is_conversation_member(((storage.foldername(name))[1])::uuid, (select auth.uid()))
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );
create policy "Users delete their chat files" on storage.objects for delete to authenticated
  using (
    bucket_id = 'chat-files'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update, delete on public.conversation_members to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
revoke all on function public.is_conversation_member(uuid, uuid) from public;
grant execute on function public.is_conversation_member(uuid, uuid) to authenticated;
revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$$;
