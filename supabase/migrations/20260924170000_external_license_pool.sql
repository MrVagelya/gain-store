-- Run in Supabase SQL editor or via CLI. Keys are not stored in the static site repo.

create table if not exists public.external_license_pool (
  id bigint generated always as identity primary key,
  license_key text not null unique,
  assigned_session_id text unique,
  assigned_at timestamptz
);

alter table public.external_license_pool enable row level security;

-- No policies: only service_role / edge functions should access this table.

-- Insert keys once in the Supabase SQL editor (not in this public repo), e.g.:
-- insert into public.external_license_pool (license_key) values ('YOUR-KEY-HERE');

create or replace function public.assign_external_license(p_session_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  if p_session_id is null or length(trim(p_session_id)) = 0 then
    return null;
  end if;

  select license_key
  into v_key
  from public.external_license_pool
  where assigned_session_id = p_session_id
  limit 1;

  if v_key is not null then
    return v_key;
  end if;

  update public.external_license_pool
  set assigned_session_id = p_session_id,
      assigned_at = now()
  where id = (
    select id
    from public.external_license_pool
    where assigned_session_id is null
    order by id
    for update skip locked
    limit 1
  )
  returning license_key into v_key;

  return v_key;
end;
$$;

revoke all on function public.assign_external_license(text) from public;
revoke all on function public.assign_external_license(text) from anon;
revoke all on function public.assign_external_license(text) from authenticated;
