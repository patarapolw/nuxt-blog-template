import path from 'path'

import dotProp from 'dot-prop-immutable'

export const srcPostPath = (...ps: string[]) =>
  path.join(__dirname, '../content/post', ...ps)

export const srcMediaPath = (...ps: string[]) =>
  path.join(__dirname, '../content/media', ...ps)

export const buildPath = (...ps: string[]) =>
  path.join(__dirname, '../build', ...ps)

export const dstMediaPath = (...ps: string[]) =>
  path.join(__dirname, '../static/media', ...ps)

export function dotPropPick<T>(el: T, select: (string | number)[]): Partial<T> {
  let p = {} as Partial<T>

  select.map((k) => {
    p = dotProp.set(p, k, dotProp.get(el, k))
  })

  return p
}

export function dotPropOmit<T>(
  el: T,
  deSelect: (string | number)[]
): Partial<T> {
  let p = el as Partial<T>

  deSelect.map((k) => {
    p = dotProp.delete(el, k)
  })

  return p
}
