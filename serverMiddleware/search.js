import qs from 'querystring'
import { search } from '../scripts/mongo/query'

export default (req, res, next) => {
  const { q, tag, offset = '0' } = qs.parse(req.url.split('?')[1] || '')
  search({ q, tag, offset: parseInt(offset) })
    .then((r) => {
      res.end(JSON.stringify(r))
    })
    .catch(next)
}
