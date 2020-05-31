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
        tag: params.tag
      })) ||
      (await app.$axios.$post(`/api/search`, undefined, {
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
