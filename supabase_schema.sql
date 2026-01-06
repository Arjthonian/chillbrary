-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Books Table
create table public.books (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text not null,
  isbn text not null,
  category text not null,
  quantity integer not null default 0,
  available integer not null default 0,
  cover_url text,
  owner_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

-- Members Table
create table public.members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null,
  membership_type text not null default 'Standard',
  status text not null default 'active',
  user_id uuid references auth.users(id),
  join_date date default now(),
  avatar_url text,
  created_at timestamptz default now()
);

-- Transactions Table
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid references public.books(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  type text not null check (type in ('issue', 'return')),
  issue_date date not null default now(),
  due_date date not null,
  return_date date,
  status text not null check (status in ('active', 'returned', 'overdue')),
  fine numeric default 0,
  created_at timestamptz default now()
);

-- Create a view to easily query transactions with book and member details
create or replace view public.transactions_view as
select
  t.*,
  b.title as book_title,
  b.isbn as book_isbn,
  m.name as member_name,
  m.email as member_email
from
  public.transactions t
  join public.books b on t.book_id = b.id
  join public.members m on t.member_id = m.id;

-- RLS Policies
alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.transactions enable row level security;

-- Policy: Authenticated users can read/write.
-- (This assumes the app is used by internal staff. If Members are public, modify 'read' to public)
create policy "Authenticated users can read all" on public.books for select to authenticated using (true);
create policy "Authenticated users can insert" on public.books for insert to authenticated with check (auth.uid() = owner_id);
create policy "Authenticated users can update" on public.books for update to authenticated using (auth.uid() = owner_id);
create policy "Authenticated users can delete" on public.books for delete to authenticated using (auth.uid() = owner_id);

create policy "Authenticated users can read all" on public.members for select to authenticated using (true);
create policy "Only admins can insert" on public.members for insert to authenticated with check (public.is_admin());
create policy "Only admins can update" on public.members for update to authenticated using (public.is_admin());
create policy "Only admins can delete" on public.members for delete to authenticated using (public.is_admin());

create policy "Authenticated users can read all" on public.transactions for select to authenticated using (true);
create policy "Authenticated users can insert" on public.transactions for insert to authenticated with check (true);
create policy "Authenticated users can update" on public.transactions for update to authenticated using (true);
create policy "Authenticated users can delete" on public.transactions for delete to authenticated using (true);

-- Function to handle book availability on issue/return
create or replace function update_book_availability()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    if (NEW.type = 'issue') then
      update public.books set available = available - 1 where id = NEW.book_id;
    elsif (NEW.type = 'return') then
      update public.books set available = available + 1 where id = NEW.book_id;
    end if;
  elsif (TG_OP = 'UPDATE') then
    if (OLD.status = 'active' and NEW.status = 'returned') then
      update public.books set available = available + 1 where id = NEW.book_id;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;


-- Trigger to auto-update availability
create trigger update_availability_trigger
after insert or update on public.transactions
for each row execute function update_book_availability();


-- STORAGE SETUP
-- Create a bucket for book covers
insert into storage.buckets (id, name, public) 
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

-- Policy: Public can view connection
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'book-covers' );

-- Policy: Authenticated users can upload
create policy "Authenticated users can upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'book-covers' );

-- Policy: Authenticated users can update/delete (optional, for management)
create policy "Authenticated users can update"
on storage.objects for update
to authenticated
using ( bucket_id = 'book-covers' );

create policy "Authenticated users can delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'book-covers' );



-- Profiles Table (for Roles)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')) default 'member',
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'member');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;
