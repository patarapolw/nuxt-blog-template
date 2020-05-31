<template lang="pug">
.post-meta(style="margin-bottom: 0.5em;")
  .post-meta-author
    a(:href="author.link" style="width: 24px; min-width: 24px; margin-right: 0.5em;" :alt="author.login")
      img(:src="author.avatar" style="border-radius: 50%;")
    a(:href="author.link" style="margin-right: 0.5em;" :alt="author.login") {{author.login}}
  div(style="flex-grow: 1")
  div {{dateString}}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import dayjs from 'dayjs'

@Component
export default class PostHeader extends Vue {
  @Prop({ required: true }) post!: any

  author = {
    link: 'https://polv.cc',
    avatar:
      'https://en.gravatar.com/userimage/35152960/7140205ee2a71cbe54d3f2ac43c0370d.jpg?size=24',
    login: 'Pacharapol Withayasakpunt'
  }

  get dateString() {
    const m = this.post.date ? dayjs(this.post.date) : null
    return m ? m.format('ddd D MMMM YYYY') : ''
  }
}
</script>

<style lang="scss">
.post-meta {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  overflow: auto;

  .post-meta-author {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    justify-content: center;

    a {
      border: none;
      display: block;
    }
  }
}
</style>
