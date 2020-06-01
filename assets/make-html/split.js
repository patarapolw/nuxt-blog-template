// @ts-check

/**
 * @typedef ISplitOptions
 * @property {Array<[string, string]>} brackets
 * @property {string} split
 * @property {string} escape
 * @property {boolean} [keepBrace]
 */

/**
 * @typedef ISplitOpOutput
 * @property {string} [prefix]
 * @property {string} [k]
 * @property {'=' | '>' | '<'} [op]
 * @property {string} v
 */

/**
 * @type {ISplitOptions}
 */
export const defaultSplitOptions = {
  brackets: [
    ['"', '"'],
    ["'", "'"]
  ],
  split: ' ',
  escape: '\\'
}

/**
 *
 * @param {string} ss
 * @param {object} options
 * @param {Array<[string, string]>} options.brackets
 * @param {string} options.split
 * @param {string} options.escape
 * @returns {Array<string>}
 *
 * ```js
 * > split('')
 * []
 * > split('a:b "c:d e:f"')
 * ['a:b', 'c:d e:f']
 * > split('a "b c" "d e"')
 * ['a', 'b c', 'd e']
 * ```
 */
export function split(ss, options = defaultSplitOptions) {
  const bracketStack = {
    /**
     * @type {Array<string>}
     */
    data: [],
    /**
     *
     * @param {string} c
     */
    push(c) {
      this.data.push(c)
    },
    pop() {
      return this.data.pop()
    },
    peek() {
      return this.data.length > 0 ? this.data[this.data.length - 1] : undefined
    }
  }
  const tokenStack = {
    /**
     * @type {Array<string>}
     */
    data: [],
    /**
     * @type {Array<string>}
     */
    currentChars: [],
    /**
     *
     * @param {string} c
     */
    addChar(c) {
      this.currentChars.push(c)
    },
    flush() {
      const d = this.currentChars.join('')
      if (d) {
        this.data.push(d)
      }
      this.currentChars = []
    }
  }

  let prev = ''
  ss.split('').map((c) => {
    if (prev === options.escape) {
      tokenStack.addChar(c)
    } else {
      let canAddChar = true

      for (const [op, cl] of options.brackets) {
        if (c === cl) {
          if (bracketStack.peek() === op) {
            bracketStack.pop()
            canAddChar = false
            break
          }
        }

        if (c === op) {
          bracketStack.push(c)
          canAddChar = false
          break
        }
      }

      if (c === options.split && !bracketStack.peek()) {
        tokenStack.flush()
      } else if (canAddChar) {
        tokenStack.addChar(c)
      }
    }

    prev = c
  })

  tokenStack.flush()

  return tokenStack.data.map((s) => s.trim()).filter((s) => s)
}

/**
 *
 * @param {string} ss
 * @returns {Array<ISplitOpOutput>}
 *
 * ```js
 * > splitOp('a:b -c:"d e"')
 * [{"k": "a", "op": ":", "prefix": undefined, "v": "b"}, {"k": "c", "op": ":", "prefix": "-", "v": "d e"}]
 * ```
 */
export function splitOp(ss) {
  const data = split(
    ss,
    Object.assign({ keepBrace: true }, defaultSplitOptions)
  )
  /**
   * @type {Array<ISplitOpOutput>}
   */
  const output = []

  data.map((d) => {
    // eslint-disable-next-line no-useless-escape
    const m = /^([\-+])?([A-Z_\-]+)([=><])(.+)$/i.exec(d)
    if (m) {
      const [, prefix, k, op, v] = m

      output.push({
        prefix,
        k,
        /**
         * @type {any}
         */
        op,
        v: removeBraces(v)
      })
    } else {
      output.push({
        v: removeBraces(d)
      })
    }
  })

  return output
}

/**
 *
 * @param {string} ss
 * @returns {string}
 */
function removeBraces(ss) {
  const m = /^(.)(.+)(.)$/.exec(ss)
  if (m) {
    for (const [op, cl] of defaultSplitOptions.brackets) {
      if (op === m[1] && cl === m[3]) {
        return m[2]
      }
    }
  }

  return ss
}
