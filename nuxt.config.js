import fs from 'fs'

import axios from 'axios'

export default {
  mode: 'universal',
  target: 'static',
  telemetry: true,
  /*
   ** Headers of the page
   */
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
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [
    'highlight.js/styles/default.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/fontawesome.js',
    '~/plugins/requestIdleCallback.client.js'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build'],
  /*
   ** Nuxt.js modules
   */
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
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {}
  },
  env: {
    title: "polv's homepage",
    baseUrl: 'https://www.polv.cc',
    tag: fs.readFileSync('tag.json', 'utf-8')
  },
  async routes() {
    const r = await axios
      .create({
        baseURL: 'https://cms.polv.cc'
      })
      .post('/api/post/', {
        cond: {
          category: 'blog'
        },
        offset: 0,
        limit: null,
        hasCount: false,
        projection: {
          slug: 1,
          tag: 1,
          date: 1
        }
      })

    const posts = r.data.data
    const routes = ['/', '/blog']

    const blog = new Set()
    const tag = new Map()

    const getUrl = (h) => {
      if (h.date) {
        const d = new Date(h.date)
        return `/post/${d.getFullYear().toString()}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${h.slug}`
      }

      return `/post/${h.slug}`
    }

    posts.map((p) => {
      blog.add(p)
      routes.push(getUrl(p))

      if (p.tag) {
        p.tag.map((t) => {
          const ts = tag.get(t) || new Set()
          ts.add(p)
          tag.set(t, ts)
        })
      }
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
