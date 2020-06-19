import qs from 'query-string'
import SparkMD5 from 'spark-md5'

export function getGravatarUrl(email?: string, size?: number, d = 'robohash') {
  return `https://www.gravatar.com/avatar/${
    email ? SparkMD5.hash(email.trim().toLocaleLowerCase()) : '0'
  }?${qs.stringify({
    s: size,
    d
  })}`
}
