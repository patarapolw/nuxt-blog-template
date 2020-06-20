<template>
  <PostFull :post="post" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import PostFull from '@/components/PostFull.vue'

@Component({
  components: {
    PostFull
  },
  layout: 'blog',
  async asyncData({ app, params }) {
    const {
      title,
      image,
      tag,
      excerpt,
      contentHtml,
      date
    } = (await app.$axios.$get(`/serverMiddleware/post`, {
      params: {
        slug: params.slug
      }
    }))!

    return {
      post: {
        title,
        image,
        tag,
        excerpt,
        contentHtml,
        date
      }
    }
  }
})
export default class PostPage extends Vue {
  post!: {
    title: string
    image?: string
    tag?: string[]
    excerpt: string
    contentHtml: string
  }

  head() {
    const { title: _title, excerpt, tag, image } = this.post
    const title = `${_title} - ${process.env.title}`
    const description = excerpt

    return {
      title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: description
        },
        ...(tag
          ? [
              {
                hid: 'keywords',
                name: 'keywords',
                content: tag.join(',')
              }
            ]
          : []),
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
          hid: 'twitter:title',
          property: 'twitter:title',
          content: title
        },
        {
          hid: 'twitter:description',
          property: 'twitter:description',
          content: description
        },
        ...(image
          ? [
              {
                hid: 'og:image',
                property: 'og:image',
                content: image
              },
              {
                hid: 'twitter:image',
                property: 'twitter:image',
                content: image
              }
            ]
          : [])
      ]
    }
  }
}
</script>
