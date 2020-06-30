import dotProp from 'dot-prop-immutable'

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
