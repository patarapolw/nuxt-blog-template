// @ts-check

import fs from 'fs'
import fg from 'fast-glob'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
import * as z from 'zod'
import lunr from 'lunr'
import dayjs from 'dayjs'

async function main() {
  await new Promise((resolve, reject) => {
    rimraf('./build/*.json', (e) => (e ? reject(e) : resolve()))
  })

  const files = await fg('assets/posts/*.md')
  /**
   * @type {any[]}
   */
  const rawJson = []

  files.map((f) => {
    const slug = f.replace(/^.+\//, '').replace(/\.md/, '')
    /**
     * @type {Record<string, any>}
     */
    let header = {}
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
      title: header.title,
      date: header.date ? dayjs(header.date).toISOString() : undefined,
      image: header.image,
      tag: z
        .array(z.string())
        .parse(header.tag || [])
        .map((t) => t.toLocaleLowerCase().replace(/ /g, '-')),
      excerpt
    }

    rawJson.push(p)
  })

  fs.writeFileSync(
    './build/raw.json',
    JSON.stringify(
      rawJson.reduce((prev, { slug, ...p }) => ({ ...prev, [slug]: p }), {})
    )
  )
  fs.writeFileSync(
    './build/idx.json',
    JSON.stringify(
      lunr(function() {
        this.ref('slug')
        this.field('title', { boost: 5 })
        this.field('tag', { boost: 5 })
        this.field('excerpt')

        rawJson.map((doc) => {
          this.add(doc)
        })
      })
    )
  )
  fs.writeFileSync(
    './build/tag.json',
    JSON.stringify(
      rawJson.reduce((prev, { tag = [] }) => {
        /**
         * @type {string[]}
         */
        const ts = tag

        ts.map((t) => {
          prev[t] = (prev[t] || 0) + 1
        })

        return prev
      }, {})
    )
  )
}

if (require.main === module) {
  main()
}
