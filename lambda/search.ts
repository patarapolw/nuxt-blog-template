import { Context, Callback } from 'aws-lambda'

export function handler(_event: any, _: Context, callback: Callback) {
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello world ${Math.floor(Math.random() * 10)}`
    })
  })
}
