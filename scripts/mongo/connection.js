import mongodb from 'mongodb'

/**
 * @type {import('mongodb').MongoClient | undefined}
 */
let client

export async function connect() {
  client =
    client ||
    (await mongodb.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }))

  const db = client.db('polv')
  return db.collection('data')
}

export async function disconnect() {
  if (client) {
    await client.close()
  }
}
