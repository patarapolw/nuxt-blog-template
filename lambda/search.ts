import { Handler, APIGatewayEvent } from 'aws-lambda'
import { search } from '../scripts/mongo/query'

export const handler: Handler = (evt: APIGatewayEvent, _, callback) => {
  const { q, tag, offset = '0' } = evt.queryStringParameters || {}

  search({ q, tag, offset: parseInt(offset) })
    .then((r) => {
      callback(undefined, {
        statusCode: 200,
        body: JSON.stringify(r)
      })
    })
    .catch(callback)
}
