<template lang="pug">
div
</template>

<script>
export default {
  middleware({ redirect }) {
    return redirect('/blog')
  }
}
</script>
