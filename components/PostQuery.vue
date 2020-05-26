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
import { Vue, Component, Watch } from 'nuxt-property-decorator'

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
  count = 0
  posts: any[] | null = null

  get q() {
    return normalizeArray(this.$route.query.q) || ''
  }

  get page() {
    return parseInt(normalizeArray(this.$route.query.page) || '1')
  }

  set page(p) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, ...query } = this.$route.query

    this.$router.push({
      query:
        p === 1
          ? query
          : {
              ...query,
              page: p.toString()
            }
    })
  }

  get tag() {
    return this.$route.params.tag
  }

  created() {
    this.updatePosts()
  }

  @Watch('page')
  @Watch('q')
  @Watch('tag')
  async updatePosts() {
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
  }
}
</script>
