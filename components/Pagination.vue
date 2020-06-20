<template>
  <section class="tw-my-4 tw-mx-2">
    <nav
      class="pagination is-rounded"
      role="navigation"
      aria-label="pagination"
    >
      <nuxt-link
        v-if="page > 1"
        :to="setPageUrl(page - 1)"
        class="pagination-previous"
      >
        <span class="icon">
          <FontAwesome icon="caret-left" />
        </span>
      </nuxt-link>

      <nuxt-link
        v-if="page < total - 1"
        :to="setPageUrl(page + 1)"
        class="pagination-next"
      >
        <span class="icon">
          <FontAwesome icon="caret-right" />
        </span>
      </nuxt-link>

      <ul class="pagination-list">
        <li v-if="page > 1">
          <nuxt-link
            :to="setPageUrl(1)"
            class="pagination-link"
            aria-label="go to page 1"
          >
            1
          </nuxt-link>
        </li>

        <li v-if="page > 3">
          <span class="pagination-ellipsis">
            &hellip;
          </span>
        </li>

        <li v-if="page > 2">
          <nuxt-link
            :to="setPageUrl(page - 1)"
            class="pagination-link"
            :aria-label="`go to page ${page - 1}`"
          >
            {{ page - 1 }}
          </nuxt-link>
        </li>

        <li>
          <nuxt-link
            :to="setPageUrl(page)"
            class="pagination-link is-current"
            :aria-label="`go to page ${page}`"
            aria-current="page"
          >
            {{ page }}
          </nuxt-link>
        </li>

        <li v-if="page < total - 1">
          <nuxt-link
            :to="setPageUrl(page + 1)"
            class="pagination-link"
            :aria-label="`go to page ${page + 1}`"
          >
            {{ page + 1 }}
          </nuxt-link>
        </li>

        <li v-if="page < total - 2">
          <span class="pagination-ellipsis">&hellip;</span>
        </li>

        <li v-if="page < total">
          <nuxt-link
            :to="setPageUrl(total)"
            class="pagination-link"
            :aria-label="`go to page ${total}`"
          >
            {{ total }}
          </nuxt-link>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class Pagination extends Vue {
  @Prop({ required: true }) total!: string

  get page() {
    return parseInt((this.$route.path.match(/\/(\d+)?$/) || [])[1] || '1')
  }

  setPageUrl(p: number) {
    const {
      path,
      query: { q }
    } = this.$route
    const path0 = path.replace(/\/(\d+)?$/, '')

    return this.$router.resolve({
      path: `${path0 || '/blog'}${p === 1 ? '' : `/${p}`}`,
      query: { q }
    }).href
  }
}
</script>
