-- Community creation fields and safe demo content for the first registered user.

alter table public.communities add column if not exists visibility text not null default 'public'
  check (visibility in ('public', 'private'));
alter table public.communities add column if not exists tags text[] not null default '{}';
alter table public.communities add column if not exists rules jsonb not null default '[]'::jsonb;

do $$
declare
  seed_owner uuid;
  craft_id uuid := '10000000-0000-4000-8000-000000000001';
  founders_id uuid := '10000000-0000-4000-8000-000000000002';
begin
  select id into seed_owner from public.profiles order by created_at limit 1;
  if seed_owner is null then
    raise notice 'No profile exists yet; demo content was skipped.';
    return;
  end if;

  update public.profiles set
    bio = case when bio = '' then 'Builder, learner, and community member exploring useful ideas with thoughtful people.' else bio end,
    location = case when location = '' then 'Bengaluru, India' else location end
  where id = seed_owner;

  insert into public.communities (id, slug, name, description, category, owner_id, visibility, tags, rules)
  values
    (craft_id, 'frontend-craft', 'Frontend Craft', 'Practical discussions on CSS, accessibility, performance, and resilient UI architecture.', 'Technology', seed_owner, 'public', array['React','Accessibility','OpenSource'], '["Be kind and constructive", "Share practical context", "No unsolicited promotion"]'),
    (founders_id, 'indie-founders', 'Indie Founders', 'A thoughtful space for people building sustainable products and communities.', 'Startups', seed_owner, 'public', array['Startup','Community','Product'], '["Give before you ask", "Respect confidential work", "Keep feedback actionable"]')
  on conflict (slug) do nothing;

  select id into craft_id from public.communities where slug = 'frontend-craft';
  select id into founders_id from public.communities where slug = 'indie-founders';

  insert into public.posts (id, author_id, community_id, body)
  values
    ('20000000-0000-4000-8000-000000000001', seed_owner, craft_id, 'Welcome to Frontend Craft! What small accessibility improvement made the biggest difference in your latest project?'),
    ('20000000-0000-4000-8000-000000000002', seed_owner, founders_id, 'Share one lesson you learned while turning an idea into something real. The messier the lesson, the more useful it may be.'),
    ('20000000-0000-4000-8000-000000000003', seed_owner, null, 'Connectly is live. Introduce yourself and share one topic you would enjoy helping someone else learn.')
  on conflict (id) do nothing;

  insert into public.profile_interests (profile_id, interest_id)
  select seed_owner, id from public.interests where name in ('Technology', 'Design', 'Education')
  on conflict do nothing;
end
$$;
