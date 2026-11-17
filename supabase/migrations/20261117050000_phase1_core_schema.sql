-- Fase 1: core multi-tenant schema + RLS
-- Tables: organizations, businesses, users, contacts, pipelines, pipeline_stages, leads
-- NOTE: Apply only with explicit authorization (see .cursor/rules). Do not run against production from agents.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- organizations (tenant root)
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- businesses (belongs to organization)
-- ---------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, name)
);

create index businesses_organization_id_idx on public.businesses (organization_id);

-- ---------------------------------------------------------------------------
-- users (membership: auth user ↔ organization + business)
-- MVP roles: admin | vendedor
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  role text not null check (role in ('admin', 'vendedor')),
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id, business_id),
  constraint users_business_belongs_to_org
    foreign key (organization_id, business_id)
    references public.businesses (organization_id, id)
);

create index users_auth_user_id_idx on public.users (auth_user_id);
create index users_organization_business_idx on public.users (organization_id, business_id);

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone_e164 text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_business_belongs_to_org
    foreign key (organization_id, business_id)
    references public.businesses (organization_id, id)
);

create index contacts_organization_business_idx on public.contacts (organization_id, business_id);
create index contacts_phone_e164_idx on public.contacts (business_id, phone_e164);

-- ---------------------------------------------------------------------------
-- pipelines + stages (stages required so leads can link to a stage)
-- ---------------------------------------------------------------------------
create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pipelines_business_belongs_to_org
    foreign key (organization_id, business_id)
    references public.businesses (organization_id, id)
);

create index pipelines_organization_business_idx on public.pipelines (organization_id, business_id);

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  pipeline_id uuid not null references public.pipelines (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pipeline_stages_business_belongs_to_org
    foreign key (organization_id, business_id)
    references public.businesses (organization_id, id),
  unique (pipeline_id, name)
);

create index pipeline_stages_pipeline_id_idx on public.pipeline_stages (pipeline_id);
create index pipeline_stages_organization_business_idx
  on public.pipeline_stages (organization_id, business_id);

-- ---------------------------------------------------------------------------
-- leads (opportunities)
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete restrict,
  pipeline_id uuid not null references public.pipelines (id) on delete restrict,
  stage_id uuid not null references public.pipeline_stages (id) on delete restrict,
  title text not null,
  amount numeric(14, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_business_belongs_to_org
    foreign key (organization_id, business_id)
    references public.businesses (organization_id, id)
);

create index leads_organization_business_idx on public.leads (organization_id, business_id);
create index leads_contact_id_idx on public.leads (contact_id);
create index leads_pipeline_stage_idx on public.leads (pipeline_id, stage_id);

-- ---------------------------------------------------------------------------
-- RLS helper: membership check (SECURITY DEFINER bypasses RLS on users)
-- ---------------------------------------------------------------------------
create or replace function public.is_business_member(
  p_organization_id uuid,
  p_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.auth_user_id = auth.uid()
      and u.organization_id = p_organization_id
      and u.business_id = p_business_id
  );
$$;

revoke all on function public.is_business_member(uuid, uuid) from public;
grant execute on function public.is_business_member(uuid, uuid) to authenticated;

create or replace function public.is_org_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.auth_user_id = auth.uid()
      and u.organization_id = p_organization_id
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.businesses enable row level security;
alter table public.users enable row level security;
alter table public.contacts enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.leads enable row level security;

-- ---------------------------------------------------------------------------
-- organizations policies
-- ---------------------------------------------------------------------------
create policy organizations_select_member
  on public.organizations
  for select
  to authenticated
  using (public.is_org_member(id));

create policy organizations_insert_authenticated
  on public.organizations
  for insert
  to authenticated
  with check (true);

create policy organizations_update_member
  on public.organizations
  for update
  to authenticated
  using (public.is_org_member(id))
  with check (public.is_org_member(id));

-- ---------------------------------------------------------------------------
-- businesses policies
-- ---------------------------------------------------------------------------
create policy businesses_select_member
  on public.businesses
  for select
  to authenticated
  using (public.is_business_member(organization_id, id));

create policy businesses_insert_org_member
  on public.businesses
  for insert
  to authenticated
  with check (public.is_org_member(organization_id));

create policy businesses_update_member
  on public.businesses
  for update
  to authenticated
  using (public.is_business_member(organization_id, id))
  with check (public.is_business_member(organization_id, id));

create policy businesses_delete_member
  on public.businesses
  for delete
  to authenticated
  using (public.is_business_member(organization_id, id));

-- ---------------------------------------------------------------------------
-- users (membership) policies — scoped to shared business membership
-- ---------------------------------------------------------------------------
create policy users_select_same_business
  on public.users
  for select
  to authenticated
  using (public.is_business_member(organization_id, business_id));

create policy users_insert_same_business
  on public.users
  for insert
  to authenticated
  with check (
    public.is_business_member(organization_id, business_id)
    or auth_user_id = auth.uid()
  );

create policy users_update_same_business
  on public.users
  for update
  to authenticated
  using (public.is_business_member(organization_id, business_id))
  with check (public.is_business_member(organization_id, business_id));

create policy users_delete_same_business
  on public.users
  for delete
  to authenticated
  using (public.is_business_member(organization_id, business_id));

-- ---------------------------------------------------------------------------
-- Shared tenant policies for business-data tables
-- ---------------------------------------------------------------------------
create policy contacts_select_member
  on public.contacts for select to authenticated
  using (public.is_business_member(organization_id, business_id));
create policy contacts_insert_member
  on public.contacts for insert to authenticated
  with check (public.is_business_member(organization_id, business_id));
create policy contacts_update_member
  on public.contacts for update to authenticated
  using (public.is_business_member(organization_id, business_id))
  with check (public.is_business_member(organization_id, business_id));
create policy contacts_delete_member
  on public.contacts for delete to authenticated
  using (public.is_business_member(organization_id, business_id));

create policy pipelines_select_member
  on public.pipelines for select to authenticated
  using (public.is_business_member(organization_id, business_id));
create policy pipelines_insert_member
  on public.pipelines for insert to authenticated
  with check (public.is_business_member(organization_id, business_id));
create policy pipelines_update_member
  on public.pipelines for update to authenticated
  using (public.is_business_member(organization_id, business_id))
  with check (public.is_business_member(organization_id, business_id));
create policy pipelines_delete_member
  on public.pipelines for delete to authenticated
  using (public.is_business_member(organization_id, business_id));

create policy pipeline_stages_select_member
  on public.pipeline_stages for select to authenticated
  using (public.is_business_member(organization_id, business_id));
create policy pipeline_stages_insert_member
  on public.pipeline_stages for insert to authenticated
  with check (public.is_business_member(organization_id, business_id));
create policy pipeline_stages_update_member
  on public.pipeline_stages for update to authenticated
  using (public.is_business_member(organization_id, business_id))
  with check (public.is_business_member(organization_id, business_id));
create policy pipeline_stages_delete_member
  on public.pipeline_stages for delete to authenticated
  using (public.is_business_member(organization_id, business_id));

create policy leads_select_member
  on public.leads for select to authenticated
  using (public.is_business_member(organization_id, business_id));
create policy leads_insert_member
  on public.leads for insert to authenticated
  with check (public.is_business_member(organization_id, business_id));
create policy leads_update_member
  on public.leads for update to authenticated
  using (public.is_business_member(organization_id, business_id))
  with check (public.is_business_member(organization_id, business_id));
create policy leads_delete_member
  on public.leads for delete to authenticated
  using (public.is_business_member(organization_id, business_id));
