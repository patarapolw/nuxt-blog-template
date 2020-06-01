<template lang="pug">
section
  .blog-post
    .card(style="margin-top: 1em; margin-bottom: 1em;")
      .card-content.content
        PostHeader(:post="post")
        h1.title {{post.title}}
        .image-full(v-if="post.image")
          img(:src="post.image")
        div(v-html="post.html")
        div(style="word-break: break-word")
          span(style="margin-right: 0.5em;") Tags:
          span(v-for="t in post.tag || []" :key="t" style="margin-right: 0.5em;")
            a(:href="$router.resolve('/tag/' + t).href") {{t}}
    .card(style="margin-top: 1em; margin-bottom: 1em;")
      .card-content
        #remark42
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'

import { initRemark42 } from '../assets/remark42'
import PostHeader from './PostHeader.vue'

@Component({
  components: {
    PostHeader
  },
  beforeRouteLeave() {
    if (process.client) {
      const { REMARK42 } = window as any
      if (REMARK42) {
        REMARK42.destroy()
      }
    }
  }
})
export default class PostFull extends Vue {
  @Prop({ required: true }) post!: any

  get pageUrl() {
    return process.env.baseUrl + this.$route.path
  }

  mounted() {
    this.onRouteChange()
  }

  @Watch('$route.path')
  onRouteChange() {
    if (process.client) {
      // eslint-disable-next-line camelcase
      const { REMARK42 } = window as any
      if (REMARK42) {
        REMARK42.destroy()
      }

      initRemark42(location.origin + location.pathname)
    }
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
