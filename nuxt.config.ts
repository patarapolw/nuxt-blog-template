import fs from 'fs'
import dayjs from 'dayjs'
import { Configuration } from '@nuxt/types'
import rawJson from './build/raw.json'
import { getTheme } from './types/theme'

export default async () => {
  const theme = await getTheme()

  const config: Configuration = {
    mode: 'universal',
    target: 'static',
    telemetry: false,
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      title: theme.title,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: theme.description || ''
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [
        ...(theme.sidebar?.twitter
          ? [
              {
                src: 'https://platform.twitter.com/widgets.js',
                async: true,
                charset: 'utf-8'
              }
            ]
          : []),
        ...(theme.analytics?.plausible
          ? [
              {
                src: 'https://plausible.io/js/plausible.js',
                async: true,
                defer: true,
                'data-domain': theme.analytics?.plausible
              }
            ]
          : [])
      ]
    },
    loading: { color: '#fff' },
    css: [],
    plugins: ['~plugins/fontawesome.js'],
    buildModules: ['@nuxt/typescript-build'],
    modules: [
      [
        'nuxt-mq',
        {
          defaultBreakpoint: 'desktop',
          breakpoints: {
            mobile: 600,
            tablet: 1024,
            desktop: Infinity
          }
        }
      ],
      '@nuxtjs/axios'
    ],
    axios: {
      proxy: true // Can be also an object with default options
    },
    proxy: {
      '/.netlify/functions': 'http://localhost:9000'
    },
    serverMiddleware: [
      { path: '/api/post', handler: '~/serverMiddleware/post.js' },
      { path: '/api/search', handler: '~/serverMiddleware/search.js' }
    ],
    build: {
      postcss: {
        plugins: [require('tailwindcss')]
      }
      // extend(config) {}
    },
    env: {
      title: theme.title,
      baseUrl: theme.baseUrl,
      remark42Config: JSON.stringify(theme.comments?.remark42 || null),
      author: JSON.stringify(theme.author),
      social: JSON.stringify(theme.social || {}),
      BlogLayout: JSON.stringify({
        banner: theme.banner,
        tabs: theme.tabs,
        sidebar: theme.sidebar,
        tagCloudData: JSON.parse(fs.readFileSync('./build/tag.json', 'utf-8')),
        hasSocial: !!theme.social
      })
    },
    generate: {
      // @ts-ignore
      crawler: false,
      routes() {
        const routes = ['/', '/blog']

        const blog = new Set()
        const tag = new Map()

        const getUrl = (h: { slug: string; date?: Date }) => {
          if (h.date) {
            const d = dayjs(h.date).toDate()
            return `/post/${d.getFullYear().toString()}/${(d.getMonth() + 1)
              .toString()
              .padStart(2, '0')}/${h.slug}`
          }

          return `/post/${h.slug}`
        }

        Object.entries<{
          tag?: string[]
          date?: string
        }>(rawJson)
          .map(([slug, { tag, date }]) => ({
            slug,
            tag,
            date
          }))
          .map((f) => {
            const p = {
              slug: f.slug,
              date: f.date ? dayjs(f.date).toDate() : undefined
            }
            blog.add(p)
            routes.push(getUrl(p))

            const ts: string[] = f.tag || []

            ts.map((t) => {
              const ts = tag.get(t) || new Set()
              ts.add(p)
              tag.set(t, ts)
            })
          })

        Array(Math.ceil(blog.size / 5))
          .fill(null)
          .map((_, i) => {
            if (i > 0) {
              routes.push(`/blog/${i + 1}`)
            }
          })

        Array.from(tag).map(([t, ts]) => {
          Array(Math.ceil(ts.size / 5))
            .fill(null)
            .map((_, i) => {
              if (i > 0) {
                routes.push(`/tag/${t}/${i + 1}`)
              } else {
                routes.push(`/tag/${t}`)
              }
            })
        })

        return routes
      }
    }
  }

  return config
}
