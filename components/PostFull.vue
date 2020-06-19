<template>
  <section>
    <article class="card tw-my-4">
      <div class="card-content">
        <PostHeader :date="post.date" />
        <h1 class="title">{{ post.title }}</h1>

        <div v-if="post.image" className="image-full">
          <img :src="post.image" :alt="post.title" />
        </div>

        <div class="content" v-html="post.contentHtml" />

        <div class="tw-break-word">
          Tags:&nbsp;
          <nuxt-link
            v-for="t in post.tag || []"
            :key="t"
            :to="`/tag/${t}`"
            class="tw-mr-2"
            >{{ t }}</nuxt-link
          >
        </div>
      </div>
    </article>

    <footer v-if="hasComment" class="card tw-my-4">
      <div class="card-content">
        <div id="remark42" />
      </div>
    </footer>
  </section>
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

  hasComment = !!process.env.remark42Config

  get pageUrl() {
    return process.env.baseUrl + this.$route.path
  }

  mounted() {
    this.onRouteChange()
  }

  @Watch('$route.path')
  onRouteChange() {
    if (process.env.remark42Config && process.client) {
      // eslint-disable-next-line camelcase
      const { REMARK42 } = window as any
      if (REMARK42) {
        REMARK42.destroy()
      }

      initRemark42(
        JSON.parse(process.env.remark42Config),
        location.origin + location.pathname
      )
    }
  }
}
</script>

<style scoped>
.image-full {
  text-align: center;
  margin: 1rem;
}

.image-full img {
  min-width: 500px;
  width: auto;
}

@media only screen and (max-width: 800px) {
  .image-full {
    margin-left: -1.5rem;
    margin-right: -1.5rem;
  }

  .image-full img {
    min-width: unset;
    width: auto;
  }
}
</style>
