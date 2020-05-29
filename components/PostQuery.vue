<template lang="pug">
section
  section(v-if="tag" style="margin: 1em;")
    h2.title.is-2
      span(style="margin-right: 0.5em;") Tag:
      span(style="font-weight: 400") {{tag}}
  section(v-if="posts && posts.length > 0")
    PostTeaser(v-for="p in posts" :post="p" :key="p.name")
    b-pagination.my-lg.mx-sm(:current.sync="page" :total="count" :per-page="5"
    icon-prev="caret-left" icon-next="caret-right" size="default" rounded)
  div(v-else-if="posts")
    empty
  div(v-else)
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'nuxt-property-decorator'

import PostTeaser from './PostTeaser.vue'
import Empty from './Empty.vue'
import { normalizeArray, api } from '@/assets/util'

@Component({
  components: {
    PostTeaser,
    Empty
  }
})
export default class PostQuery extends Vue {
  @Prop({ required: true }) defaults!: {
    count: number
    posts: any[]
  }

  count = 0
  posts: any[] | null = null

  get q() {
    return normalizeArray(this.$route.query.q) || ''
  }

  get page() {
    return parseInt(this.$route.params.page || '1')
  }

  set page(p) {
    const { path } = this.$route
    const path0 = path.replace(/\/(\d+)?$/, '')
    this.$router.push(`${path0 || '/blog'}${p === 1 ? '' : `/${p}`}`)
  }

  get tag() {
    return this.$route.params.tag
  }

  created() {
    this.updatePosts()
  }

  @Watch('page')
  @Watch('tag')
  async updatePosts() {
    if (this.q) {
      const ps = (
        await api.post('/api/post/', {
          q: this.q,
          cond: {
            category: 'blog',
            tag: this.tag
          },
          offset: (this.page - 1) * 5,
          limit: 5,
          hasCount: true,
          sort: {
            key: 'date',
            desc: true
          },
          projection: {
            slug: 1,
            title: 1,
            tag: 1,
            header: 1,
            excerpt: 1,
            remaing: 1,
            date: 1
          }
        })
      ).data

      this.count = ps.count
      this.$set(this, 'posts', ps.data)
    } else {
      this.count = this.defaults.count
      this.$set(this, 'posts', this.defaults.posts)
    }
  }

  @Watch('q')
  async onQChanged() {
    await this.updatePosts()
    this.page = 1
  }
}
</script>
