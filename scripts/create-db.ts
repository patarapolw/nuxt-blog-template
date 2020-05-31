import fs from 'fs'
import sqlite3 from 'better-sqlite3'
import fg from 'fast-glob'
import yaml from 'js-yaml'
import rimraf from 'rimraf'

async function main(filename: string) {
  await new Promise((resolve, reject) => {
    rimraf(filename, (e) => (e ? reject(e) : resolve()))
  })

  const sql = sqlite3(filename)
  sql.exec(/* sql */ `
  CREATE TABLE [raw] (
    slug    TEXT PRIMARY KEY,
    [date]  TEXT,
    [image] TEXT,
    tag     TEXT NOT NULL, -- space separated
    excerpt TEXT NOT NULL
  );

  CREATE VIRTUAL TABLE q USING FTS5(slug, tag, excerpt);
  `)

  const files = await fg('assets/posts/*.md')

  const insertRaw = sql.prepare(/* sql */ `
  INSERT INTO [raw] (slug, [date], [image], tag, excerpt)
  VALUES (@slug, @date, @image, @tag, @excerpt)
  `)
  const insertQ = sql.prepare(/* sql */ `
  INSERT INTO q (slug, tag, excerpt)
  VALUES (@slug, @tag, @excerpt)
  `)

  sql.transaction(() => {
    files.map((f) => {
      const slug = f.replace(/^.+\//, '').replace(/\.md/, '')
      let header: any = {}
      const md = fs.readFileSync(f, 'utf8')
      let excerpt = md

      if (md.startsWith('---\n')) {
        const [h, c = ''] = md.substr(4).split(/---\n(.*)$/s)
        header = yaml.safeLoad(h, {
          schema: yaml.JSON_SCHEMA
        })
        excerpt = c.split(/<!-- excerpt_separator -->/)[0]
      }

      const p = {
        slug,
        date: header.date,
        image: header.image,
        tag: (header.tag || [])
          .map((t: string) => t.toLocaleLowerCase().replace(/ /g, '-'))
          .join(' '),
        excerpt
      }

      insertRaw.run(p)
      insertQ.run({
        slug: p.slug.replace(/-/g, ' '),
        tag: p.tag,
        excerpt: p.excerpt
      })
    })
  })()

  sql.close()
}

if (require.main === module) {
  main('./build/db.sqlite3')
}

// ;(async () => {
//   const r = await axios.post('https://cms.polv.cc/api/post/', {
//     cond: {
//       category: 'blog'
//     },
//     limit: null,
//     projection: {
//       tag: 1
//     }
//   })

//   const tag = r.data.data
//     .map((h) => h.tag || [])
//     .reduce((prev, c) => [...prev, ...c], [])
//     .reduce((prev, c) => {
//       c = c.toLocaleLowerCase()
//       prev[c] = (prev[c] || 0) + 1
//       return prev
//     }, {})

//   fs.writeFileSync('tag.json', JSON.stringify(tag))
// })()
