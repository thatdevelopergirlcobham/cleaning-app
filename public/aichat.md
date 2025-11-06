create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);



alter table public.ai_chat_messages enable row level security;




-- Authenticated users can insert their own messages
create policy "insert_own_ai_messages"
on public.ai_chat_messages
for insert
to authenticated
with check (auth.uid() = user_id);

-- Authenticated users can read only their messages
create policy "read_own_ai_messages"
on public.ai_chat_messages
for select
to authenticated
using (auth.uid() = user_id);

-- Optional: allow users to delete their messages
create policy "delete_own_ai_messages"
on public.ai_chat_messages
for delete
to authenticated
using (auth.uid() = user_id);


-- enable if needed
create extension if not exists "uuid-ossp";