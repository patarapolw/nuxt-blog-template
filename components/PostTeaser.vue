<template lang="pug">
.card.blog-post(style="margin-bottom: 1em; margin-top: 1em;")
  .card-content
    PostHeader(:post="post")
    .post-content
      .image-teaser(v-if="post.header.image")
        img(:src="post.header.image")
      h2.title {{post.title}}
      .content(v-html="post.excerpt")
    div(style="display: flex; justify-content: flex-end; color: #383838;")
      nuxt-link.button.is-danger.is-outlined(:to="url") Read more
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'

import PostHeader from './PostHeader.vue'
import { highlightBlock } from '@/assets/hljs'

@Component({
  components: {
    PostHeader
  }
})
export default class PostTeaser extends Vue {
  @Prop({ required: true }) post!: any

  get url() {
    const h = this.post

    if (h.date) {
      const d = new Date(h.date)
      return `/post/${d.getFullYear().toString()}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${h.slug}`
    }

    return `/post/${h.slug}`
  }

  mounted() {
    this.onExcerptUpdate()
  }

  @Watch('excerpt')
  onExcerptUpdate() {
    highlightBlock(this.$el)
  }
}
</script>

<style lang="scss">
.content {
  width: 100%;
  margin: 0;
  max-width: 80vw;
}

.post-content {
  width: 100%;
  overflow: visible;
}

.image-teaser {
  width: calc(100% + 3rem);
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin-left: -1.5rem;
  margin-right: -1.5rem;
}

@media only screen and (min-width: 800px) {
  .image-teaser {
    width: 100%;
    max-width: 300px;
    max-height: 300px;
    float: right;
    margin: 1rem;
  }

  .post-content {
    overflow: auto;
  }
}
</style>
