import fs from 'fs'

import { Configuration } from '@nuxt/types'
import dayjs from 'dayjs'

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
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/media/favicon.ico' }],
      script: [
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
    plugins: [
      '~plugins/fontawesome.ts',
      ...(theme.comments?.remark42 ? ['~plugins/remark42.client.js'] : [])
    ],
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
      { path: '/serverMiddleware/post', handler: '~/serverMiddleware/post.ts' },
      {
        path: '/serverMiddleware/search',
        handler: '~/serverMiddleware/search.ts'
      }
    ],
    build: {
      postcss: {
        plugins: [require('tailwindcss')]
      }
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

        const getUrl = ({ path }: { path: string }) => {
          return `/post/${path}`
        }

        Object.entries<{
          tag?: string[]
          date?: string
        }>(rawJson)
          .map(([path, { tag, date }]) => ({
            path,
            tag,
            date
          }))
          .map((f) => {
            const p = {
              path: f.path,
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
