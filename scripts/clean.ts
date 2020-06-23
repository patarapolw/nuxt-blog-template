import rimraf from 'rimraf'

import { buildPath, dstMediaPath } from './util'

export function clean() {
  rimraf.sync(buildPath('*.json'))
  rimraf.sync(dstMediaPath('**/*'))
}
