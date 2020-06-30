import rimraf from 'rimraf'

import { buildPath, dstMediaPath } from './dir'

export function clean() {
  rimraf.sync(buildPath('*.json'))
  rimraf.sync(dstMediaPath('**/*'))
}
