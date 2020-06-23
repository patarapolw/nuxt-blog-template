import { Handler } from 'aws-lambda'
import lunr, { Index } from 'lunr'

import idxJson from '../build/idx.json'
import rawJson from '../build/raw.json'

let idx: Index

export const handler: Handler = async (evt) => {
  const { q = '', tag, offset = '0' } = evt.queryStringParameters || {}

  idx = idx || lunr.Index.load(idxJson)

  let allData = idx.search(q).map(({ ref }) => {
    const { date, image, title, excerptHtml, tag, path } = rawJson[ref]
    return {
      path,
      date,
      image,
      title,
      excerptHtml,
      tag
    }
  })

  if (tag) {
    allData = allData.filter(({ tag }) => tag && tag.includes(tag))
  }

  const count = allData.length
  const result = allData
    .sort(({ date: a }, { date: b }) => {
      return a ? (b ? b.localeCompare(a) : a) : b
    })
    .slice(parseInt(offset), parseInt(offset) + 5)

  return {
    statusCode: 200,
    body: JSON.stringify({
      count,
      result
    })
  }
}
