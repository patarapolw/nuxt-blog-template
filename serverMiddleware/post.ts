import qs from 'querystring'
import { ServerMiddleware } from '@nuxt/types'
import rawJson from '../build/raw.json'
import { normalizeArray } from '../assets/util'

const router: ServerMiddleware = (req, res, next) => {
  if (!req.originalUrl) {
    next(new Error('no req.originalUrl'))
    return
  }

  const { slug: _slug } = qs.parse(req.originalUrl.split('?')[1] || '')
  const slug = normalizeArray(_slug)

  if (!slug) {
    next(new Error('slug must be provided'))
    return
  }

  const r = rawJson[slug] || {}
  res.end(
    JSON.stringify({
      slug,
      ...r
    })
  )
}

export default router
