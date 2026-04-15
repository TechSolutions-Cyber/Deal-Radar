-- User favorite supermarkets
create table if not exists user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  supermarket text not null,
  created_at timestamptz default now(),
  unique(user_id, supermarket)
);

alter table user_favorites enable row level security;

create policy "Users manage own favorites"
  on user_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User wishlist (deal snapshots)
create table if not exists user_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  deal_id text not null,
  deal_data jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, deal_id)
);

alter table user_wishlist enable row level security;

create policy "Users manage own wishlist"
  on user_wishlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for fast per-user lookups
create index if not exists user_favorites_user_id_idx on user_favorites(user_id);
create index if not exists user_wishlist_user_id_idx on user_wishlist(user_id);
