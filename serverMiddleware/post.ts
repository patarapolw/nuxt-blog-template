import qs from 'querystring'

import { ServerMiddleware } from '@nuxt/types'

import { normalizeArray } from '../assets/util'
import rawJson from '../build/raw.json'

const router: ServerMiddleware = (req, res, next) => {
  if (!req.originalUrl) {
    next(new Error('no req.originalUrl'))
    return
  }

  const { path: _path } = qs.parse(req.originalUrl.split('?')[1] || '')
  const path = normalizeArray(_path)

  if (!path) {
    next(new Error('slug must be provided'))
    return
  }

  const r = rawJson[path] || {}
  res.end(JSON.stringify(r))
}

export default router
