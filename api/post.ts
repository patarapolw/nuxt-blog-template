import { NowApiHandler } from '@now/node'
import { normalizeArray } from '../assets/util'
import { get } from '../scripts/query'

const handler: NowApiHandler = (req, res) => {
  const slug = normalizeArray(req.query.slug) || ''
  res.json(get(slug) || {})
}

export default handler
