create extension if not exists "pgcrypto";

create type public.workspace_role as enum ('owner', 'member');
create type public.card_priority as enum ('low', 'medium', 'high');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  preferences jsonb not null default '{"theme":"system","accent":"#3558f5"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  background text not null default '#f5f6f8',
  position integer not null default 0 check (position >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  position integer not null check (position >= 0),
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  description text,
  priority public.card_priority,
  due_date date,
  position integer not null check (position >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  unique (board_id, name)
);

create table public.card_labels (
  card_id uuid not null references public.cards(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (card_id, label_id)
);

create index boards_workspace_idx on public.boards(workspace_id, position);
create index columns_board_idx on public.columns(board_id, position);
create index cards_column_idx on public.cards(column_id, position);
create index cards_board_idx on public.cards(board_id);
create index workspace_members_user_idx on public.workspace_members(user_id);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.workspace_members where workspace_id = target_workspace and user_id = auth.uid());
$$;

create or replace function public.can_access_board(target_board uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.boards b join public.workspace_members m on m.workspace_id = b.workspace_id where b.id = target_board and m.user_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;
alter table public.labels enable row level security;
alter table public.card_labels enable row level security;

create policy "profiles read own" on public.profiles for select using (id = auth.uid());
create policy "profiles update own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "members read workspace" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "workspaces read member" on public.workspaces for select using (public.is_workspace_member(id));
create policy "workspaces update owner" on public.workspaces for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "boards member all" on public.boards for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());
create policy "columns member all" on public.columns for all using (public.can_access_board(board_id)) with check (public.can_access_board(board_id));
create policy "cards member all" on public.cards for all using (public.can_access_board(board_id)) with check (public.can_access_board(board_id) and created_by = auth.uid());
create policy "labels member all" on public.labels for all using (public.can_access_board(board_id)) with check (public.can_access_board(board_id));
create policy "card labels read" on public.card_labels for select using (exists(select 1 from public.cards where id = card_id and public.can_access_board(board_id)));
create policy "card labels insert" on public.card_labels for insert with check (exists(select 1 from public.cards where id = card_id and public.can_access_board(board_id)));
create policy "card labels delete" on public.card_labels for delete using (exists(select 1 from public.cards where id = card_id and public.can_access_board(board_id)));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  new_workspace uuid;
  new_board uuid;
begin
  insert into public.profiles (id, full_name, avatar_url) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data ->> 'avatar_url');
  insert into public.workspaces (name, owner_id) values ('Meu espaço', new.id) returning id into new_workspace;
  insert into public.workspace_members (workspace_id, user_id, role) values (new_workspace, new.id, 'owner');
  insert into public.boards (workspace_id, title, created_by) values (new_workspace, 'Meu primeiro projeto', new.id) returning id into new_board;
  insert into public.columns (board_id, title, position) values (new_board, 'Ideias', 0), (new_board, 'A fazer', 1), (new_board, 'Em andamento', 2), (new_board, 'Concluído', 3);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger boards_updated_at before update on public.boards for each row execute procedure public.set_updated_at();
create trigger cards_updated_at before update on public.cards for each row execute procedure public.set_updated_at();
