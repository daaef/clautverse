// Seeds categories, countries and Stars for local dev/tests. Idempotent. Usage: node --env-file=.env scripts/seed.mjs
import postgres from 'postgres'

const sql = postgres(process.env.NUXT_DATABASE_URL, { prepare: false, max: 1 })
await sql.begin(async (tx) => {
  await tx`insert into category (slug, name, active, sort_order) values
    ('reality-tv', 'Reality TV', true, 0), ('music', 'Music', false, 1), ('sports', 'Sports', false, 2)
    on conflict (slug) do nothing`
  await tx`insert into country (code, name) values ('NG', 'Nigeria'), ('GH', 'Ghana'), ('ZA', 'South Africa')
    on conflict (code) do nothing`
  // Placeholder Stars until task 5 seeds the fictional pilot set.
  await tx`insert into talent (slug, name, category_id, country_id, known_for, bio)
    select v.slug, v.name, c.id, k.id, v.known_for, 'Housemate' from (values
      ('ada', 'Ada', 'Housemate, Season 10 · 2025'), ('bisi', 'Bisi', 'Housemate, Season 10 · 2025'), ('chidi', 'Chidi', 'Housemate, Season 10 · 2025')
    ) as v(slug, name, known_for)
    join category c on c.slug = 'reality-tv' join country k on k.code = 'NG'
    on conflict (slug) do nothing`
})
await sql.end()
console.log('seeded')
