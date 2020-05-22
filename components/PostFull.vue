<template lang="pug">
section
  .blog-post
    .card(style="margin-top: 1em; margin-bottom: 1em;")
      .card-content.content
        PostHeader(:post="post")
        h1.title {{post.title}}
        .image-full(v-if="post.header.image")
          img(:src="post.header.image")
        div(v-html="post.excerpt + post.remaining")
        div(style="word-break: break-word")
          span(style="margin-right: 0.5em;") Tags:
          span(v-for="t in post.tag || []" :key="t" style="margin-right: 0.5em;")
            a(:href="$router.resolve('/tag/' + t).href") {{t}}
    .card(style="margin-top: 1em; margin-bottom: 1em;")
      .card-content
        vue-disqus(v-if="disqus" :shortname="disqus" :identifier="$route.path")
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'

import { highlightBlock } from '../assets/hljs'
import PostHeader from './PostHeader.vue'

@Component({
  components: {
    PostHeader
  }
})
export default class PostFull extends Vue {
  @Prop({ required: true }) post!: any

  disqus = 'patarapolw-blog'

  mounted() {
    this.updatePost()
  }

  @Watch('content')
  updatePost() {
    highlightBlock(this.$el)
  }
}
</script>

<style lang="scss">
.image-full {
  text-align: center;
  margin: 1rem;

  img {
    min-width: 500px;
    width: auto;
  }
}

@media only screen and (max-width: 800px) {
  .image-full {
    margin-left: -1.5rem;
    margin-right: -1.5rem;

    img {
      min-width: unset;
      width: auto;
    }
  }
}
</style>
