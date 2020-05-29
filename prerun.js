const fs = require('fs')
const axios = require('axios')

;(async () => {
  const r = await axios.post('https://cms.polv.cc/api/post/', {
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

  fs.writeFileSync('tag.json', JSON.stringify(tag))
})()
