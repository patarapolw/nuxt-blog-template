// @ts-check

import * as z from 'zod'
import { splitOp } from '../../assets/make-html/split'
import { connect } from './connection'

/**
 *
 * @param {object} [opts={}]
 * @param {string | undefined} [opts.q]
 * @param {string | undefined} [opts.tag]
 * @param {number} [opts.offset]
 */
export async function search(opts = {}) {
  const { q = '', tag, offset = 0 } = z
    .object({
      q: z.string().optional(),
      tag: z.string().optional(),
      offset: z.number().optional()
    })
    .parse(opts)

  /**
   * @type {any[]}
   */
  const whereFts = []
  /**
   * @type {any[]}
   */
  const whereRaw = tag
    ? [
        {
          k: 'tag',
          op: '=',
          v: tag
        }
      ]
    : []

  splitOp(q).map((p) => {
    if (!p.k) {
      whereFts.push(p)
    } else {
      whereRaw.push(p)
    }
  })

  const cond = (() => {
    /**
     * @type {any}
     */
    const $$op = {
      '>': '$gt',
      '<': '$lt'
    }

    /**
     * @type {Record<string, any>[]}
     */
    const $or = []
    /**
     * @type {Record<string, any>[]}
     */
    const $and = []

    /**
     * @type {Record<string, any>[]}
     */
    const $not = []

    whereRaw.map(({ prefix, k, op, v }) => {
      const $op = $$op[op]
      const $cond = $op
        ? { [k]: { [$op]: { $literal: v } } }
        : { [k]: { $literal: v } }
      if (prefix === '?') {
        $or.push($cond)
      } else if (prefix === '-') {
        $not.push($cond)
      } else {
        $and.push($cond)
      }
    })

    if ($or.length > 0) {
      $and.push({ $or })
    }

    if ($not.length > 0) {
      $and.push({ $nor: $not })
    }

    if ($and.length === 0) {
      return {}
    }

    if ($and.length === 1) {
      return $and[0]
    }

    return { $and }
  })()

  const col = await connect()
  const r = await col
    .aggregate([
      ...(whereFts.length > 0
        ? [
            {
              $match: {
                $text: {
                  $search: whereFts
                    .map(({ prefix = '', v }) => `${prefix}${v}`)
                    .join(' ')
                }
              }
            }
          ]
        : []),
      { $match: cond },
      {
        $facet: {
          result: [
            {
              $project: {
                slug: '$_id',
                title: 1,
                date: 1,
                image: 1,
                tag: 1,
                excerpt: 1
              }
            },
            { $sort: { date: 1 } },
            { $skip: offset },
            { $limit: 5 }
          ],
          count: [{ $count: 'count' }]
        }
      }
    ])
    .toArray()

  return {
    result: r[0].result,
    count: r[0].count[0].count
  }
}

/**
 *
 * @param {string} slug
 */
export async function get(slug) {
  const col = await connect()
  const { title, image, tag } =
    (await col.findOne(
      { _id: slug },
      { projection: { title: 1, image: 1, tag: 1 } }
    )) || {}

  return { title, image, tag }
}
