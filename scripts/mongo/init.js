import { connect, disconnect } from './connection'

async function main() {
  const col = await connect()
  await col.createIndex({
    title: 'text',
    _id: 'text',
    tag: 'text',
    excerpt: 'text'
  })

  await disconnect()
}

if (require.main === module) {
  main()
}
