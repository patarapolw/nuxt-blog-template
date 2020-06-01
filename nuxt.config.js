// @ts-check

import fs from 'fs'
import { connect, disconnect } from './scripts/mongo/connection'

export default {
  mode: 'universal',
  target: 'static',
  telemetry: false,
  head: {
    htmlAttrs: {
      lang: 'en'
    },
    title: "polv's homepage",
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: "polv's homepage"
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    script: [
      {
        src: 'https://platform.twitter.com/widgets.js',
        async: true,
        charset: 'utf-8'
      }
    ]
  },
  loading: { color: '#fff' },
  css: [
    'highlight.js/styles/default.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  plugins: [
    '~/plugins/fontawesome.js',
    '~/plugins/requestIdleCallback.client.js'
  ],
  buildModules: ['@nuxt/typescript-build'],
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    [
      'nuxt-buefy',
      {
        // css: false,
        materialDesignIcons: false,
        defaultIconPack: 'fa',
        defaultIconComponent: 'fa'
      }
    ],
    [
      'nuxt-mq',
      {
        defaultBreakpoint: 'desktop',
        breakpoints: {
          mobile: 500,
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
  build: {
    /**
     *
     * @param {any} config
     */
    extend(config) {
      config.module.rules.push({
        test: /assets\/posts\/.+\.md$/,
        loader: 'raw-loader',
        options: {
          esModule: false
        }
      })
    }
  },
  env: {
    title: "polv's homepage",
    baseUrl: 'https://www.polv.cc',
    tag: fs.readFileSync('build/tag.json', 'utf8')
  },
  async routes() {
    const col = await connect()
    const r = await col
      .find({}, { projection: { _id: 1, tag: 1, date: 1 } })
      .toArray()
    const routes = ['/', '/blog']

    const blog = new Set()
    const tag = new Map()

    /**
     *
     * @param {object} h
     * @param {string} h.slug
     * @param {Date | undefined} [h.date]
     */
    const getUrl = (h) => {
      if (h.date) {
        const d = new Date(h.date)
        return `/post/${d.getFullYear().toString()}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${h.slug}`
      }

      return `/post/${h.slug}`
    }

    r.map((f) => {
      const p = {
        slug: f._id,
        date: f.date
      }
      blog.add(p)
      routes.push(getUrl(p))

      /**
       * @type {string[]}
       */
      const ts = (f.tag || '').split(' ')

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

    await disconnect()

    return routes
  }
}
