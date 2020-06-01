import qs from 'querystring'
import { search } from '../scripts/sqlite/query'

export default (req, res) => {
  const { q, tag, offset = '0' } = qs.parse(req.originalUrl.split('?')[1] || '')

  const r = search({ q, tag, offset: parseInt(offset) })
  res.end(JSON.stringify(r))
}
