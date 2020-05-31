<template lang="pug">
PostQuery(:defaults="defaults")
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { search } from '@/scripts/query'
import PostQuery from '@/components/PostQuery.vue'

@Component({
  components: {
    PostQuery
  },
  layout: 'blog',
  // eslint-disable-next-line require-await
  async asyncData({ app }) {
    const ps = search() || (await app.$axios.$post('/api/search'))

    return {
      defaults: {
        count: ps!.count,
        posts: ps!.result
      }
    }
  }
})
export default class Blog extends Vue {}
</script>
