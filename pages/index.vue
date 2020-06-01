<template lang="pug">
PostQuery(:defaults="defaults")
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import PostQuery from '@/components/PostQuery.vue'

@Component({
  components: {
    PostQuery
  },
  layout: 'blog',
  async asyncData({ app }) {
    const ps = await app.$axios.$get('/api/search')

    return {
      defaults: {
        count: ps.count,
        posts: ps.result
      }
    }
  }
})
export default class Blog extends Vue {}
</script>
