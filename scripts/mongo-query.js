import mongodb from 'mongodb'
import QSearch from '@patarapolw/qsearch'
import * as z from 'zod'

let client

const qSearch = new QSearch({
  dialect: 'mongodb',
  schema: {
    slug: {},
    date: { type: 'date' },
    title: {},
    tag: {},
    excerpt: {}
  }
})

export async function search(q, opts) {
  q = z.string().parse(q)
  // eslint-disable-next-line prefer-const
  let { cond, offset } = z
    .object({
      cond: z.record(),
      offset: z.number()
    })
    .parse(opts)

  client =
    client ||
    (await mongodb.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }))
  const col = client.db('mdsearch').collection('polv')

  if (q) {
    if (cond) {
      cond = {
        $and: [q, cond]
      }
    } else {
      cond = qSearch.parse(q).cond
    }
  }

  const [rData, rCount] = await Promise.all([
    col
      .find(cond)
      .skip(offset)
      .limit(5)
      .toArray(),
    col.countDocuments(cond)
  ])

  return {
    result: rData,
    count: rCount
  }
}
