import rawJson from '@/build/raw.json'

import { IPost } from './build'
import { dotPropPick } from './util'

export const getPost = ({
  path,
  select
}: {
  path: string
  select: string[]
}) => {
  const el = rawJson[path] as IPost
  if (!el) {
    throw new Error('content not found')
  }

  return dotPropPick(el, select)
}
