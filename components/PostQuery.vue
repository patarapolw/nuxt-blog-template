<template lang="pug">
section
  section(v-if="tag" style="margin: 1em;")
    h2.title.is-2
      span(style="margin-right: 0.5em;") Tag:
      span(style="font-weight: 400") {{tag}}
  b-loading(v-if="isLoading")
  section(v-else-if="posts.length > 0")
    PostTeaser(v-for="p in posts" :post="p" :key="p.name")
    b-pagination.my-lg.mx-sm(:current.sync="page" :total="count" :per-page="5"
    icon-prev="caret-left" icon-next="caret-right" size="default" rounded)
  div(v-else)
    empty
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'nuxt-property-decorator'
import PostTeaser from './PostTeaser.vue'
import Empty from './Empty.vue'
import { normalizeArray } from '@/assets/util'

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
  posts: any[] = []
  isLoading = true

  get q() {
    return normalizeArray(this.$route.query.q) || ''
  }

  get page() {
    return parseInt(this.$route.params.page || '1')
  }

  set page(p) {
    const { path } = this.$route
    const path0 = path.replace(/\/(\d+)?$/, '')
    this.$router.push({
      path: `${path0 || '/blog'}${p === 1 ? '' : `/${p}`}`,
      query: this.$route.query
    })
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
    this.isLoading = true
    if (this.q) {
      const ps = await this.$axios.$post(
        '/.netlify/functions/search',
        undefined,
        {
          params: {
            q: this.q,
            offset: (this.page - 1) * 5,
            tag: this.tag
          }
        }
      )

      this.count = ps.count
      this.$set(this, 'posts', ps.result)
    } else {
      this.count = this.defaults.count
      this.$set(this, 'posts', this.defaults.posts)
    }
    this.isLoading = false
  }

  @Watch('q')
  onQChanged() {
    this.$router.push({
      path: '/blog',
      query: this.$route.query
    })
    this.page = 1
    this.updatePosts()
  }
}
</script>
