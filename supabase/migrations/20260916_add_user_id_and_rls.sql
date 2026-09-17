-- 익명 로그인 도입에 맞춰 characters 테이블에 소유자(user_id)를 추가하고 RLS를 건다.
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣어 한 번 실행하면 된다.
-- (사전 준비: Authentication > Sign In / Providers 에서 "Anonymous sign-ins" 를 켜둘 것)

-- 1) 소유자 컬럼
--    기존 행들은 user_id 가 NULL 로 남는다. 주인을 알 수 없는 "무명의 기록"으로,
--    세계관 타임라인/통계에는 계속 잡히지만 누적 포인트에는 포함되지 않는다.
alter table public.characters
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- 2) 누적 포인트 조회(user_id 로 필터)용 인덱스
create index if not exists characters_user_id_idx
  on public.characters (user_id);

-- 3) RLS 활성화
alter table public.characters enable row level security;

-- 4) 읽기: 세계관 타임라인/통계와 가족도가 남의 기록까지 읽어야 하므로 전체 공개.
--    TODO: 이름/생애기록까지 다 열려 있는 상태라, 나중에 grade·race·birth_year·death_year 만
--          노출하는 뷰를 만들고 fetchWorldRecords() 가 그 뷰를 보게 바꾸는 편이 좋다.
drop policy if exists "characters_select_public" on public.characters;
create policy "characters_select_public"
  on public.characters
  for select
  using (true);

-- 5) 쓰기: 로그인된(익명 포함) 사용자가 자기 소유의 행만 넣을 수 있다.
--    user_id 를 비우거나 남의 id 로 넣는 insert 는 거부된다.
drop policy if exists "characters_insert_own" on public.characters;
create policy "characters_insert_own"
  on public.characters
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 6) update/delete 정책은 일부러 만들지 않는다 → 한번 남긴 생은 아무도 고치거나 지울 수 없다.
