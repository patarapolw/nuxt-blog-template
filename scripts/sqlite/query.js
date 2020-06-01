// @ts-check

import sqlite3 from 'better-sqlite3'
import * as z from 'zod'
import dayjs from 'dayjs'
import { splitOp } from '../../assets/make-html/split'

/**
 * @typedef SqlItem
 * @property {string} slug
 * @property {string} title
 * @property {Date | undefined} [date]
 * @property {string} [image]
 * @property {string[]} tag
 * @property {string} excerpt
 */

export const sql = sqlite3('./build/db.sqlite3', { readonly: true })

/**
 *
 * @param {object} [opts={}]
 * * @param {string | undefined} [opts.q]
 * @param {string | undefined} [opts.tag]
 * @param {number} [opts.offset]
 */
export function search(opts = {}) {
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

  /**
   * @type {string[] | null}
   */
  let ids = null

  if (whereFts.length > 0) {
    const pp = new SQLParams()

    /**
     * @type {string[]}
     */
    const $or = []
    /**
     * @type {string[]}
     */
    const $and = []

    /**
     * @type {string[]}
     */
    const $not = []

    whereFts.map(({ prefix, v }) => {
      if (prefix === '?') {
        $or.push(`q MATCH ${pp.add(v)}`)
      } else if (prefix === '-') {
        $not.push(`q MATCH ${pp.add(v)}`)
      } else {
        $and.push(`q MATCH ${pp.add(v)}`)
      }
    })

    if ($or.length > 0) {
      $and.push(`(${$or.join(' OR ')})`)
    }

    if ($not.length > 0) {
      $and.push(`NOT (${$not.join(' AND ')})`)
    }

    if ($and.length === 0) {
      $and.push('TRUE')
    }

    ids = sql
      .prepare(
        /* sql */ `
    SELECT slug FROM q
    WHERE ${$and.join(' AND ')}
    `
      )
      .all(pp.data)
      .map((d) => d.slug)
  }

  /**
   * @type {SqlItem[]}
   */
  let result = []
  let count = 0

  if (!ids || ids.length > 0) {
    const pp = new SQLParams()

    /**
     * @type {string[]}
     */
    const $or = []
    /**
     * @type {string[]}
     */
    const $and = []

    /**
     * @type {string[]}
     */
    const $not = []

    whereRaw.map(({ prefix, k, op, v }) => {
      if (prefix === '?') {
        $or.push(`[${k}] ${op} ${pp.add(v)}`)
      } else if (prefix === '-') {
        $not.push(`[${k}] ${op} ${pp.add(v)}`)
      } else {
        $and.push(`[${k}] ${op} ${pp.add(v)}`)
      }
    })

    if ($or.length > 0) {
      $and.push(`(${$or.join(' OR ')})`)
    }

    if ($not.length > 0) {
      $and.push(`NOT (${$not.join(' AND ')})`)
    }

    if ($and.length === 0) {
      $and.push('TRUE')
    }

    result = sql
      .prepare(
        /* sql */ `
    SELECT * FROM [raw]
    WHERE ${$and.join(' AND ')}
    ORDER BY [date] DESC NULLS LAST
    LIMIT ${offset}, 5
    `
      )
      .all(pp.data)
      .map((r) => ({
        slug: r.slug,
        title: r.title,
        date: r.date ? dayjs(r.date).toDate() : undefined,
        image: r.image || undefined,
        tag: r.tag.split(' '),
        excerpt: r.excerpt
      }))

    count =
      (
        sql
          .prepare(
            /* sql */ `
    SELECT COUNT(*) count FROM [raw]
    WHERE ${$and.join(' AND ')}
    `
          )
          .get(pp.data) || {}
      ).count || 0
  }

  return {
    result,
    count
  }
}

/**
 *
 * @param {string} slug
 */
export function get(slug) {
  const r = sql
    .prepare(
      /* sql */ `
  SELECT title, [image], tag
  FROM [raw]
  WHERE slug = ?
  `
    )
    .get([slug])

  return {
    title: r.title,
    image: r.image,
    tag: r.tag.split(' ')
  }
}

export class SQLParams {
  /**
   * @type {Record<string, any>}
   */
  data = {}
  counter = 0

  /**
   *
   * @param {string | number | null | undefined} v
   */
  add(v) {
    if (Object.keys(this.data).length >= 1000) {
      throw new Error(
        'SQLITE_LIMIT_VARIABLE_NUMBER exceeded. (default value: 999)'
      )
    }

    let k = ++this.counter
    while (this.data[k]) {
      k = ++this.counter
    }

    this.data[k] = v
    return '$' + k
  }
}
