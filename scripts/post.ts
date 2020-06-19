import { IPost } from './build'
import { dotPropPick } from './util'
import rawJson from '@/build/raw.json'

export const getPost = ({
  slug,
  select
}: {
  slug: string
  select: string[]
}) => {
  const el = rawJson[slug] as IPost
  if (!el) {
    throw new Error('content not found')
  }

  return dotPropPick(el, select)
}
