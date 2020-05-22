<template lang="pug">
.container(style="margin: 0.5em;")
  h4.title.is-4 Sorry, but no post can be found.
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class Empty extends Vue {}
</script>
