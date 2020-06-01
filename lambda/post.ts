import { Handler, APIGatewayEvent } from 'aws-lambda'
import { get } from '../scripts/mongo/query'

export const handler: Handler = (evt: APIGatewayEvent, _, callback) => {
  const { slug } = evt.queryStringParameters || {}
  if (!slug) {
    callback(new Error('slug must be provided'))
  }

  get(slug)
    .then((r) => {
      callback(undefined, {
        statusCode: 200,
        body: JSON.stringify(r)
      })
    })
    .catch(callback)
}
