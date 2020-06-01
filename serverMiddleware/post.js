import qs from 'querystring'
import rawJson from '../build/raw.json'

export default (req, res, next) => {
  const { slug } = qs.parse(req.originalUrl.split('?')[1] || '')

  if (!slug) {
    next(new Error('slug must be provided'))
  }

  const r = rawJson[slug] || {}
  res.end(
    JSON.stringify({
      slug,
      ...r
    })
  )
}
