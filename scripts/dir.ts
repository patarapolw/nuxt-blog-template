import path from 'path'

import dotenv from 'dotenv'

dotenv.config()

export const CONTENT_PATH =
  process.env.CONTENT_PATH || path.resolve(process.cwd(), 'content')

export const srcPostPath = (...ps: string[]) =>
  path.join(CONTENT_PATH, 'post', ...ps)

export const srcMediaPath = (...ps: string[]) =>
  path.join(CONTENT_PATH, 'media', ...ps)

export const buildPath = (...ps: string[]) =>
  path.join(__dirname, '../build', ...ps)

export const dstMediaPath = (...ps: string[]) =>
  path.join(__dirname, '../static/media', ...ps)
