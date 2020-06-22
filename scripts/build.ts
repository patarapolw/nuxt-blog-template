import path from 'path'

import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import lunr from 'lunr'
import rimraf from 'rimraf'
import * as z from 'zod'

import MakeHtml, { localizeImage, staticPath } from './make-html'

export interface IPost {
  slug: string
  // path: string
  title: string
  image?: string
  tag?: string[]
  date?: string
  excerpt: string
  excerptHtml: string
  contentHtml: string
}

export async function buildIndexes() {
  const contentPath = (p: string) => path.join(__dirname, '../content/blog', p)
  const mediaPath = (p: string) => path.join(__dirname, '../content/media', p)
  const buildPath = (p: string) => path.join(__dirname, '../build', p)

  rimraf.sync(buildPath('*.json'))

  try {
    fs.unlinkSync(staticPath('media'))
  } catch (_) {}

  const files = await fg(contentPath('**/*.md'))
  const rawJson: IPost[] = []

  const jsDomCleanup = MakeHtml.initJsDom()

  await Promise.all(
    files.map(async (f) => {
      const slug = f.replace(/^.+\//, '').replace(/\.mdx?$/, '')
      let header: Record<string, any> = {}
      let markdown = fs.readFileSync(f, 'utf8')
      let excerpt = markdown

      if (markdown.startsWith('---\n')) {
        const [h, c = ''] = markdown.substr(4).split(/---\n(.*)$/s)
        header = yaml.safeLoad(h, {
          schema: yaml.JSON_SCHEMA
        })
        excerpt = c.split(/<!-- excerpt(?:_separator)? -->/)[0]
        markdown = c
      }

      const makeHtml = new MakeHtml(slug)
      const { title, date, image: unlocalizedImage, tag } = (() => {
        const { title, date, image, tag } = header
        return z
          .object({
            title: z.string(),
            date: z.string().optional(),
            image: z.string().optional(),
            tag: z.array(z.string()).optional()
          })
          .parse({ title, date, image, tag })
      })()

      const image = unlocalizedImage
        ? await localizeImage(unlocalizedImage)
        : null

      const p: IPost = {
        slug,
        title,
        date: date ? dayjs(date).toISOString() : undefined,
        image: image ? `/${image}` : undefined,
        tag: (tag || []).map((t) => t.toLocaleLowerCase().replace(/ /g, '-')),
        excerpt,
        excerptHtml: await makeHtml.render(excerpt),
        contentHtml: await makeHtml.render(markdown)
      }

      rawJson.push(p)
    })
  )

  jsDomCleanup()

  fs.writeFileSync(
    buildPath('raw.json'),
    JSON.stringify(
      rawJson.reduce((prev, { slug, ...p }) => ({ ...prev, [slug]: p }), {})
    )
  )
  fs.writeFileSync(
    buildPath('idx.json'),
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
    buildPath('tag.json'),
    JSON.stringify(
      rawJson.reduce((prev, { tag = [] }) => {
        const ts: string[] = tag

        ts.map((t) => {
          prev[t] = (prev[t] || 0) + 1
        })

        return prev
      }, {} as Record<string, number>)
    )
  )
  ;(
    await fg('**/*.*', {
      cwd: mediaPath('')
    })
  ).map((f) => {
    fs.ensureFileSync(staticPath(`media/${f}`))
    fs.copyFileSync(mediaPath(f), staticPath(`media/${f}`))
  })
}

if (require.main === module) {
  buildIndexes()
}
