import { APIGatewayProxyHandler } from 'aws-lambda'
import { search } from '../scripts/mongo-query'

export const handler: APIGatewayProxyHandler = (evt, _, callback) => {
  const { q = '', offset = '0', tag } = evt.queryStringParameters || {}

  search(q, {
    cond: {
      tag
    },
    offset: parseInt(offset)
  })
    .then((r) => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(r)
      })
    })
    .catch(callback)
}
