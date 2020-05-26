<template lang="pug">
PostQuery
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import PostQuery from '@/components/PostQuery.vue'

@Component({
  components: {
    PostQuery
  },
  layout: 'blog'
})
export default class Tag extends Vue {}
</script>
