<template lang="pug">
section
  b-navbar.navbar-shadow.noscroll.is-fixed-top(style="max-width: 100vw;")
    template(slot="brand")
      div(style="display: inline-flex; overflow: auto; max-width: calc(100vw - 3.25rem); flex-grow: 1")
        b-navbar-item(tag="router-link" to="/")
          h1.bold {{banner}}
        div(style="flex-grow: 1")
        page-social(v-show="$mq === 'tablet'")
    template(slot="start")
      b-navbar-item(v-for="t in tabs"
        :tag="t.to ? 'router-link': 'a'"
        :href="t.url" :to="t.to"
        :target="t.to ? '' : '_blank'"
        :key="t.name") {{t.name}}
    template(slot="end")
      page-social(v-show="$mq !== 'tablet'" :class="{'w-100': ($mq === 'mobile')}")
      form.field(@submit.prevent="onSearch" style="margin: 0.5em; padding-left: 0.5em; padding-right: 0.5em;")
        .control.has-icons-right
          input.input.is-rounded(type="search" placeholder="Search" v-model="q")
          span.icon.is-right
            fa(icon="search")
  section(style="margin-top: 3.25rem")
    .container
      .columns
        main.column.is-6-desktop.is-offset-1-desktop
          nuxt
        aside.column.is-4
          section
            .card(style="margin-top: 1em; margin-bottom: 1em;")
              header.card-header
                p.card-header-title Tag cloud
              .card-content(style="word-break: break-word")
                span.bn-tag(v-for="t in tags" :key="t.name")
                  router-link(:class="t.class" :to="'/tag/' + t.name") {{t.name}}
            .card.my-lg
              a.twitter-timeline(data-height="800" href="https://twitter.com/patarapolw") Tweets by patarapolw
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import PageSocial from '@/components/PageSocial.vue'
import { normalizeArray } from '@/assets/util'

@Component({
  components: {
    PageSocial
  }
})
export default class Default extends Vue {
  banner = "polv's coding blog"
  tabs = [
    {
      name: 'Pinned',
      to: '/tag/pinned'
    }
  ]

  q = ''
  fullUrl = 'https://polv.cc'

  get tags() {
    const tagList = JSON.parse(process.env.tag!)

    return Object.keys(tagList)
      .sort((a, b) => {
        return tagList[b] - tagList[a]
      })
      .slice(0, 30)
      .map((t) => {
        if (['pinned', 'dev.to'].includes(t)) {
          return null
        }
        return {
          name: t,
          class: (() => {
            const count = tagList[t]
            // if (count > 20) {
            //   return 'c20'
            // } else
            // if (count > 10) {
            //   return 'c10'
            // } else
            if (count > 5) {
              return 'c5'
            } else if (count > 3) {
              return 'c3'
            } else if (count > 1) {
              return 'c2'
            }
            return 'c1'
          })()
        }
      })
      .filter((el) => el)
  }

  head() {
    const url = this.fullUrl + this.$route.path

    return {
      link: [
        {
          rel: 'canonical',
          href: url
        }
      ],
      meta: [
        {
          hid: 'og:url',
          property: 'og:url',
          content: this.fullUrl
        }
      ]
    }
  }

  mounted() {
    this.q = normalizeArray(this.$route.query.q) || ''

    if (process.client) {
      const { twttr } = window as any
      if (twttr) {
        twttr.widgets.load()
      }
    }
  }

  onSearch() {
    this.$router.push({
      path: '/blog',
      query: { q: this.q }
    })
  }
}
</script>

<style lang="scss">
.navbar-shadow {
  $n: 0.1rem;

  box-shadow: 0 $n $n rgba(0, 0, 0, 0.13), $n $n $n rgba(0, 0, 0, 0.1),
    -$n -$n $n rgba(0, 0, 0, 0.05);
}

.bold {
  font-weight: bold;
}

.w-100 {
  width: 100%;
  margin: 0 auto;
}

.bn-tag {
  white-space: nowrap;
  margin-right: 10px;
  $c-size: 0.6em;
  .c20 {
    font-size: 10 * $c-size;
  }
  .c10 {
    font-size: 5 * $c-size;
  }
  .c5 {
    font-size: 3 * $c-size;
  }
  .c3 {
    font-size: 2 * $c-size;
  }
  .c2 {
    font-size: 1.5 * $c-size;
  }
  .c1 {
    font-size: $c-size;
  }
}
</style>
