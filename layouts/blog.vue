<template>
  <section>
    <nav
      class="navbar has-shadow is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <nuxt-link to="/" class="navbar-item">
          <h1 class="tw-font-bold">{{ banner }}</h1>
        </nuxt-link>

        <div class="tw-flex-grow" />

        <PageSocial v-if="hasSocial && $mq === 'tablet'" />

        <a
          role="button"
          class="navbar-burger burger"
          :class="{ 'is-active': isNavExpanded }"
          aria-label="menu"
          :aria-expanded="isNavExpanded"
          tabIndex="0"
          data-target="navbarMain"
          @click="isNavExpanded = !isNavExpanded"
          @keypress="isNavExpanded = !isNavExpanded"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbarMain"
        class="navbar-menu"
        :class="{ 'is-active': isNavExpanded }"
      >
        <div class="navbar-start">
          <component
            :is="t.to ? 'nuxt-link' : 'a'"
            v-for="t in tabs"
            :key="t.name"
            class="navbar-item"
            :to="t.to"
            :target="t.href ? '_blank' : ''"
            :href="t.href"
            rel="noopener nofollow noreferrer"
          >
            {{ t.name }}
          </component>
        </div>

        <div class="navbar-end">
          <PageSocial
            v-if="hasSocial && $mq !== 'tablet'"
            class="mobile:tw-w-full"
          />

          <form
            class="field has-addons tw-m-2 tw-px-2"
            @submit.prevent="$router.push(`/blog?q=${q}`)"
          >
            <div class="control is-expanded" role="search">
              <input
                v-model="q"
                class="input is-rounded"
                type="search"
                placeholder="Search"
                aria-label="search"
              />
            </div>

            <div class="control">
              <button
                class="button"
                style="border-top-right-radius: 100%; border-bottom-right-radius: 100%"
              >
                <span class="icon">
                  <FontAwesome icon="search" />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </nav>

    <article class="tw-mt-16">
      <div class="container">
        <div class="columns">
          <main
            class="column tw-mt-4"
            :class="
              sidebar
                ? 'is-6-desktop is-offset-1-desktop'
                : 'is-8-desktop is-offset-2-desktop'
            "
          >
            <nuxt />
          </main>

          <aside v-if="sidebar" class="column is-4">
            <section
              v-if="sidebar.tagCloud && tagCloudData"
              class="card tw-mt-4"
            >
              <header class="card-header">
                <h3 class="card-header-title">Tag Cloud</h3>
              </header>

              <article
                class="card-content tw-flex tw-flex-wrap tw-items-baseline"
              >
                <span
                  v-for="t in computedTags"
                  :key="t.name"
                  class="tw-whitespace-no-wrap tw-mr-2"
                >
                  <nuxt-link :to="`/tag/${t.name}`" :class="t.class">{{
                    t.name
                  }}</nuxt-link>
                </span>
              </article>
            </section>

            <client-only>
              <section v-if="sidebar.twitter" class="card tw-mt-4">
                <Timeline
                  :id="sidebar.twitter"
                  source-type="profile"
                  :options="{ height: 800 }"
                />
              </section>
            </client-only>
          </aside>
        </div>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { normalizeArray } from '@/assets/util'
import PageSocial from '@/components/PageSocial.vue'

import { ISidebar, ITabs } from '../types/theme'

import '@/assets/css/tailwind.css'
import 'bulma/css/bulma.min.css'
import 'highlight.js/styles/default.css'

const rawData = JSON.parse(process.env.BlogLayout!)

@Component({
  components: {
    PageSocial,
    ...(rawData.sidebar?.twitter
      ? {
          Timeline: async () => (await import('vue-tweet-embed')).Timeline
        }
      : {})
  }
})
export default class BlogLayout extends Vue {
  banner: string = rawData.banner
  tabs: ITabs = rawData.tabs || []
  sidebar: ISidebar | null = rawData.sidebar || null
  tagCloudData: Record<string, number> = rawData.tagCloudData
  hasSocial: boolean = rawData.hasSocial

  q = ''
  isNavExpanded = false

  get fullUrl() {
    return process.env.baseUrl!
  }

  get computedTags() {
    return Object.keys(this.tagCloudData)
      .sort((a, b) => {
        const primary = this.tagCloudData[b] - this.tagCloudData[a]
        if (primary) {
          return primary
        }
        return a.localeCompare(b)
      })
      .slice(0, 30)
      .map((t) => {
        if (
          this.sidebar?.tagCloud?.excluded &&
          this.sidebar.tagCloud.excluded.includes(t)
        ) {
          return null
        }
        return {
          name: t,
          class: (() => {
            const count = this.tagCloudData[t]
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
  }

  onSearch() {
    this.$router.push({
      path: '/blog',
      query: { q: this.q }
    })
  }
}
</script>

<style scoped>
.c20 {
  font-size: 6rem;
}

.c10 {
  font-size: 3rem;
}

.c5 {
  font-size: 1.8rem;
}

.c3 {
  font-size: 1.2rem;
}

.c2 {
  font-size: 0.9rem;
}

.c1 {
  font-size: 0.6rem;
}
</style>
