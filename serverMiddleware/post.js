import qs from 'querystring'
import { get } from '../scripts/mongo/query'

export default (req, res, next) => {
  const { slug } = qs.parse(req.url.split('?')[1] || '')

  if (!slug) {
    next(new Error('slug must be provided'))
  }

  get(slug)
    .then((r) => {
      res.end(JSON.stringify(r))
    })
    .catch(next)
}
