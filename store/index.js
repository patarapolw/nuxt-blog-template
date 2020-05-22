export const state = () => ({
  tag: {}
})

export const mutations = {
  setTag(state, tag) {
    state.tag = tag
  }
}

export const actions = {
  async nuxtServerInit({ commit }) {
    const r = await this.$axios.post('https://bd.polv.cc/api/post/', {
      cond: {
        category: 'blog'
      },
      limit: null,
      projection: {
        tag: 1
      }
    })

    const tag = r.data.data
      .map((h) => h.tag || [])
      .reduce((prev, c) => [...prev, ...c], [])
      .reduce((prev, c) => {
        c = c.toLocaleLowerCase()
        prev[c] = (prev[c] || 0) + 1
        return prev
      }, {})

    commit('setTag', tag)
  }
}
