<template>
  <PostQuery :defaults="defaults" />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import PostQuery from '@/components/PostQuery.vue'

@Component({
  components: {
    PostQuery
  },
  layout: 'blog',
  async asyncData({ app, params }) {
    const ps = await app.$axios.$get(`/serverMiddleware/search`, {
      params: {
        offset: (parseInt(params.page) - 1) * 5
      }
    })

    return {
      defaults: {
        count: ps!.count,
        posts: ps!.result
      }
    }
  }
})
export default class BlogPaged extends Vue {}
</script>
