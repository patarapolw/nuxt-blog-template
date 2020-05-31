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
  async asyncData({ app, params }) {
    const ps =
      (await search({
        offset: (parseInt(params.page) - 1) * 5
      })) ||
      (await app.$axios.$post(`/api/search`, undefined, {
        params: {
          offset: (parseInt(params.page) - 1) * 5
        }
      }))

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
