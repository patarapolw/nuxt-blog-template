import { NowApiHandler } from '@now/node'
import { normalizeArray } from '../assets/util'
import { search } from '../scripts/query'

const handler: NowApiHandler = (req, res) => {
  const q = normalizeArray(req.query.q) || ''
  const tag = normalizeArray(req.query.tag)
  const offset = parseInt(normalizeArray(req.query.offset) || '0')

  res.json(search({ q, tag, offset }))
}

export default handler
