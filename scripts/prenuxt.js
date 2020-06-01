import fs from 'fs'

import { main as generate } from './mongo/generate'
import { disconnect } from './mongo/connection'

async function main() {
  const col = await generate(true)
  const r = await col.find({}, { projection: { tag: 1 } }).toArray()

  fs.writeFileSync(
    'build/tag.json',
    JSON.stringify(
      r.reduce((prev, c) => {
        /**
         * @type {string[]}
         */
        const ts = c.tag || []

        ts.map((t) => {
          prev[t] = prev[t] || 0
          prev[t]++
        })

        return prev
      }, {})
    )
  )

  await disconnect()
}

if (require.main === module) {
  main()
}
