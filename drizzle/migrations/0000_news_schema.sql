create type public.app_role as enum ('admin', 'editor', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- First account ever created becomes admin
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Anyone reads categories" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  image_alt text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  author_name text not null default 'Info Spark''s Desk',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  published_at timestamptz,
  is_featured boolean not null default false,
  is_editors_pick boolean not null default false,
  is_breaking boolean not null default false,
  is_demo boolean not null default false,
  views int not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.articles (status, published_at desc);
create index on public.articles (category_id);
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "Public reads live articles" on public.articles for select
  using (status in ('published','scheduled') and published_at <= now());
create policy "Admins read all articles" on public.articles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins insert articles" on public.articles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update articles" on public.articles for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete articles" on public.articles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();

create or replace function public.increment_article_view(_slug text) returns void
language sql security definer set search_path = public as $$
  update public.articles set views = views + 1
  where slug = _slug and status in ('published','scheduled') and published_at <= now();
$$;
grant execute on function public.increment_article_view(text) to anon, authenticated;

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 80),
  body text not null check (char_length(body) between 1 and 2000),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.comments to anon, authenticated;
grant update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "Public reads approved comments" on public.comments for select using (approved = true);
create policy "Admins read all comments" on public.comments for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Anyone submits pending comments" on public.comments for insert with check (approved = false);
create policy "Admins moderate comments" on public.comments for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete comments" on public.comments for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone subscribes" on public.newsletter_subscribers for insert with check (true);
create policy "Admins read subscribers" on public.newsletter_subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete subscribers" on public.newsletter_subscribers for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  subject text not null default '' check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone sends contact" on public.contact_messages for insert with check (true);
create policy "Admins read contact" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete contact" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));