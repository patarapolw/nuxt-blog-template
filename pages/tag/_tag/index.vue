<template>
  <PostQuery :defaults="defaults" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import PostQuery from '@/components/PostQuery.vue'

@Component({
  components: {
    PostQuery
  },
  layout: 'blog',
  async asyncData({ app, params }) {
    const ps = (await app.$axios.$get(`/serverMiddleware/search`, {
      params: {
        tag: params.tag
      }
    }))!

    return {
      defaults: {
        count: ps.count,
        posts: ps.result
      }
    }
  }
})
export default class Tag extends Vue {}
</script>
