<template lang="pug">
PostFull(:post="post")
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import htmlToText from 'html-to-text'
import PostFull from '@/components/PostFull.vue'
import { api } from '@/assets/util'

@Component({
  components: {
    PostFull
  },
  layout: 'blog'
})
export default class PostPage extends Vue {
  post: any = {}

  async asyncData({ params }: any) {
    const r = await api.get('/api/post', {
      params: {
        slug: params.slug
      }
    })

    return {
      post: r.data
    }
  }

  head() {
    // eslint-disable-next-line prefer-const
    let { title, excerpt, header } = this.post
    title = `${title} - ${process.env.title}`
    const description = htmlToText.fromString(excerpt)

    return {
      title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: description
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: (header.keyword || header.tag || []).join(', ')
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: title
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: header.image
        },
        {
          hid: 'twitter:title',
          property: 'twitter:title',
          content: title
        },
        {
          hid: 'twitter:description',
          property: 'twitter:description',
          content: description
        },
        {
          hid: 'twitter:image',
          property: 'twitter:image',
          content: header.image
        }
      ]
    }
  }
}
</script>
