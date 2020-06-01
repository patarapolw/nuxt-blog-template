import fs from 'fs'
import fg from 'fast-glob'
import yaml from 'js-yaml'
import dayjs from 'dayjs'
import { connect, disconnect } from './connection'

/**
 *
 * @param {boolean} [doNotDisconnect]
 */
export async function main(doNotDisconnect) {
  const col = await connect()
  const old = (
    await col
      .find({})
      .project({ _id: 1, updatedAt: 1 })
      .toArray()
  ).reduce((prev, { _id, updatedAt }) => ({ ...prev, [_id]: updatedAt }), {})

  const files = await fg('assets/posts/*.md')

  /**
   * @type {string[]}
   */
  const newIds = []

  const ops = files
    .map((f) => {
      const _id = f
        .replace(/^.+\//, '')
        .replace(/\.md/, '')
        .toLocaleLowerCase()
        .replace(/-/g, ' ')
      newIds.push(_id)

      let header = {}
      const md = fs.readFileSync(f, 'utf8')
      const stat = fs.statSync(f)
      let excerpt = md

      if (md.startsWith('---\n')) {
        const [h, c = ''] = md.substr(4).split(/---\n(.*)$/s)
        header = yaml.safeLoad(h, {
          schema: yaml.JSON_SCHEMA
        })
        excerpt = c.split(/<!-- excerpt_separator -->/)[0]
      }

      const p = {
        _id,
        title: header.title,
        date: header.date ? dayjs(header.date).toDate() : undefined,
        image: header.image,
        tag: header.tag,
        excerpt,
        updatedAt: stat.mtime
      }

      if (old[p._id] && old[p._id] < p.updatedAt) {
        return {
          replaceOne: {
            filter: { _id: p._id },
            replacement: p
          }
        }
      } else if (!old[p._id]) {
        return {
          insertOne: {
            document: p
          }
        }
      }

      return null
    })
    .filter((el) => el)

  if (ops.length > 0) {
    await col.bulkWrite(ops, { ordered: false })
  }

  if (newIds.length > 0) {
    await col.deleteMany({ _id: { $nin: newIds } })
  }

  if (!doNotDisconnect) {
    await disconnect()
  }

  return col
}

if (require.main === module) {
  main()
}
