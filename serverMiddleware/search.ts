import qs from 'querystring'

import { ServerMiddleware } from '@nuxt/types'
import lunr, { Index } from 'lunr'

import { normalizeArray } from '../assets/util'
import idxJson from '../build/idx.json'
import rawJson from '../build/raw.json'

let idx: Index

const router: ServerMiddleware = (req, res, next) => {
  if (!req.originalUrl) {
    next(new Error('no req.originalUrl'))
    return
  }

  const { q, tag, offset } = qs.parse(req.originalUrl.split('?')[1] || '')

  let allData

  if (q) {
    idx = idx || lunr.Index.load(idxJson)

    allData = idx.search(normalizeArray(q) || '').map(({ ref }) => {
      return rawJson[ref]
    })
  } else {
    allData = Object.values(rawJson)
  }

  if (tag) {
    allData = allData.filter((d) => d.tag && d.tag.includes(tag))
  }

  const count = allData.length
  const result = allData
    .sort(({ date: a }, { date: b }) => {
      return a ? (b ? b.localeCompare(a) : a) : b
    })
    .slice(
      parseInt(normalizeArray(offset) || '0'),
      parseInt(normalizeArray(offset) || '0') + 5
    )

  res.end(
    JSON.stringify({
      count,
      result
    })
  )
}

export default router
