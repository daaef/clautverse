// Seeds catalog data for local dev/tests. Idempotent. Usage: node --env-file=.env scripts/seed.mjs
import postgres from 'postgres'

const sql = postgres(process.env.NUXT_DATABASE_URL, { prepare: false, max: 1 })
await sql.begin(async (tx) => {
  await tx`insert into category (slug, name, active, sort_order) values
    ('reality-tv', 'Reality TV', true, 0), ('music', 'Music', false, 1), ('sports', 'Sports', false, 2)
    on conflict (slug) do nothing`
  await tx`insert into country (code, name) values ('NG', 'Nigeria'), ('GH', 'Ghana'), ('ZA', 'South Africa')
    on conflict (code) do nothing`
  await tx`insert into show (category_id, country_id, slug, name)
    select c.id, k.id, v.slug, v.name from (values ('bbnaija', 'Big Brother Naija', 'NG'), ('bbtitans', 'Big Brother Titans', 'ZA'), ('bbmzansi', 'Big Brother Mzansi', 'ZA')) as v(slug, name, code)
    join category c on c.slug = 'reality-tv' join country k on k.code = v.code
    on conflict (slug) do nothing`
  await tx`insert into season (show_id, number, name, year)
    select s.id, v.n, v.name, v.y from (values ('bbnaija', 9, 'No Loose Guard', 2024), ('bbnaija', 10, 'Season 10', 2025), ('bbtitans', 1, 'Season 1', 2023)) as v(slug, n, name, y)
    join show s on s.slug = v.slug
    on conflict (show_id, number) do nothing`
  await tx`insert into talent (slug, name, bio) values ('ada', 'Ada', 'Housemate'), ('bisi', 'Bisi', 'Housemate'), ('chidi', 'Chidi', 'Housemate')
    on conflict (slug) do nothing`
  await tx`insert into season_talent (season_id, talent_id)
    select se.id, t.id from season se join show s on s.id = se.show_id and s.slug = 'bbnaija' and se.number = 10
    cross join talent t where t.slug in ('ada', 'bisi', 'chidi')
    on conflict do nothing`
})
await sql.end()
console.log('seeded')
