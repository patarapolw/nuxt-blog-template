<template>
  <section>
    <article class="card tw-mb-4">
      <div class="card-content">
        <PostHeader :post="post" />

        <div v-if="post.image" class="tw--mx-6 tw-mb-4">
          <img class="tw-w-full" :src="post.image" :alt="post.title" />
        </div>

        <h1 class="title">{{ post.title }}</h1>

        <div class="content" v-html="post.contentHtml" />

        <div class="tw-break-word">
          <span class="tw-mr-2">Tags:</span>
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
        <div ref="remark42" />
      </div>
    </footer>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

import '~/assets/remark42'

import PostHeader from './PostHeader.vue'

@Component({
  components: {
    PostHeader
  }
})
export default class PostFull extends Vue {
  @Prop({ required: true }) post!: any

  hasComment = !!process.env.remark42Config
  remark42Instance: any = null

  get pageUrl() {
    return process.env.baseUrl + this.$route.path
  }

  mounted() {
    if (window.REMARK42) {
      this.initRemark42()
    } else {
      window.addEventListener('REMARK42::ready', () => {
        this.initRemark42()
      })
    }
  }

  beforeDestroy() {
    if (this.remark42Instance) {
      this.remark42Instance.destroy()
    }
  }

  beforeRouteLeave() {
    if (this.remark42Instance) {
      this.remark42Instance.destroy()
    }
  }

  @Watch('$route.path')
  onRouteChange() {
    this.initRemark42()
  }

  initRemark42() {
    if (process.client && process.env.remark42Config && window.REMARK42) {
      if (this.remark42Instance) {
        this.remark42Instance.destroy()
      }

      const config: import('@/types/theme').IRemark42 = JSON.parse(
        process.env.remark42Config
      )

      this.remark42Instance = window.REMARK42.createInstance({
        node: this.$refs.remark42 as HTMLElement,
        host: config.host,
        site_id: config.siteId
      })
    }
  }
}
</script>
