import qs from 'querystring'
import lunr from 'lunr'
import idxJson from '../build/idx.json'
import rawJson from '../build/raw.json'

/**
 * @type {import('lunr').Index}
 */
let idx

export default (req, res) => {
  const { q = '', tag, offset = '0' } = qs.parse(
    req.originalUrl.split('?')[1] || ''
  )

  idx = idx || lunr.Index.load(idxJson)

  let allData = idx.search(q).map(({ ref }) => {
    const data = rawJson[ref]
    return {
      slug: ref,
      ...data
    }
  })

  if (tag) {
    allData = allData.filter(({ tag }) => tag && tag.includes(tag))
  }

  const count = allData.length
  const result = allData
    .sort(({ date: a }, { date: b }) => {
      return a ? (b ? b.localeCompare(a) : a) : b
    })
    .slice(parseInt(offset), 5)

  res.end(
    JSON.stringify({
      count,
      result
    })
  )
}
