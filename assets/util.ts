import axios from 'axios'

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function normalizeArray<T>(it: T | T[]): T | undefined {
  if (Array.isArray(it)) {
    return it[0]
  }

  return it
}

export const api = axios.create({
  baseURL: 'https://cms.polv.cc'
})
