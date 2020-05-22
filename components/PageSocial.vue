<template lang="pug">
div.page-social
  b-navbar-item(href="https://twitter.com/patarapolw" target="_blank")
    fa(:icon="['fab', 'twitter']")
  b-navbar-item(href="https://www.reddit.com/user/patarapolw" target="_blank")
    fa(:icon="['fab', 'reddit']")
  b-navbar-item(href="https://www.quora.com/profile/Pacharapol-Withayasakpunt" target="_blank")
    fa(:icon="['fab', 'quora']")
  b-navbar-item(href="https://github.com/patarapolw" target="_blank")
    fa(:icon="['fab', 'github']")
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class PageSocial extends Vue {}
</script>

<style lang="scss">
.page-social {
  height: 100%;
  display: inline-flex;
  justify-content: center;
}
</style>
