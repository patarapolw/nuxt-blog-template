import qs from 'querystring'
import { get } from '../scripts/sqlite/query'

export default (req, res, next) => {
  const { slug } = qs.parse(req.originalUrl.split('?')[1] || '')

  if (!slug) {
    next(new Error('slug must be provided'))
  }

  const r = get(slug)
  res.end(JSON.stringify(r))
}
