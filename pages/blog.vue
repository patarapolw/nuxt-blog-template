<template lang="pug">
PostQuery(:defaults="defaults")
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import PostQuery from '@/components/PostQuery.vue'
import { api } from '@/assets/util'

@Component({
  components: {
    PostQuery
  },
  layout: 'blog'
})
export default class Blog extends Vue {
  async asyncData() {
    const ps = (
      await api.post('/api/post/', {
        cond: {
          category: 'blog'
        },
        offset: 0,
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

    return {
      defaults: {
        posts: ps.data,
        count: ps.count
      }
    }
  }
}
</script>
