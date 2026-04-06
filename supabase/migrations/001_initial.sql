-- MoneyTrack PWA — initial schema

-- Accounts (wallets)
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('cash','debit','credit','savings','ewallet')),
  currency text not null default 'KZT',
  initial_balance numeric not null default 0,
  icon_name text not null default 'wallet',
  color_hex text not null default '#007AFF',
  is_included_in_total boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Categories (hierarchical)
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references categories(id) on delete cascade,
  name text not null,
  icon_name text not null,
  color_hex text not null,
  type text not null check (type in ('expense','income')),
  sort_order int not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('expense','income','transfer')),
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  to_account_id uuid references accounts(id) on delete set null,
  date timestamptz not null default now(),
  note text,
  is_recurring boolean not null default false,
  recurring_rule text check (recurring_rule in ('daily','weekly','monthly','yearly')),
  created_at timestamptz not null default now()
);

-- Budgets
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  amount numeric not null,
  period text not null check (period in ('week','biweek','month','quarter')),
  start_date date not null default current_date,
  notify_at_80 boolean not null default true,
  notify_at_100 boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_transactions_user_date on transactions(user_id, date desc);
create index idx_transactions_category on transactions(category_id);
create index idx_categories_user on categories(user_id);
create index idx_accounts_user on accounts(user_id);
create index idx_budgets_user on budgets(user_id);

-- Row Level Security
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

create policy "Users manage own accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own budgets" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
