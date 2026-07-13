create type equipment as enum ('reformer', 'sol');
create type session_type as enum ('pratique', 'enseignement', 'observation');

create table coaches (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (length(trim(name)) > 0),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table sessions (
  id           uuid primary key default gen_random_uuid(),
  coach_id     uuid not null references coaches(id) on delete cascade,
  session_date date not null,
  equipment    equipment not null,
  session_type session_type not null,
  hours        numeric(4,2) not null check (hours > 0 and hours <= 12),
  created_at   timestamptz not null default now()
);

create index sessions_coach_id_idx on sessions (coach_id, session_date desc);
