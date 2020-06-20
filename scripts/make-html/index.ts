import path from 'path'
import { URL } from 'url'

import axios from 'axios'
import fs from 'fs-extra'
import he from 'he'
import hljs from 'highlight.js'
import hljsDefineVue from 'highlightjs-vue'
import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import mdContainer from 'markdown-it-container'
import emoji from 'markdown-it-emoji'
import externalLinks from 'markdown-it-external-links'
import imsize from 'markdown-it-imsize'
import { unescapeAll } from 'markdown-it/lib/common/utils'
import pug from 'pug'
import sanitize from 'sanitize-filename'
import sharp from 'sharp'
import SparkMD5 from 'spark-md5'
import stylis from 'stylis'

import { getTheme } from '../../types/theme'

import { liquid } from './template'

hljsDefineVue(hljs)

export default class MakeHtml {
  static initJsDom(): () => void {
    return require('global-jsdom')()
  }

  md: MarkdownIt
  pug: (p: string) => string

  html = ''

  constructor(
    public id = 'el-' +
      Math.random()
        .toString(36)
        .substr(2)
  ) {
    this.md = MarkdownIt({
      breaks: true
    })
      .use((md) => {
        const { fence } = md.renderer.rules

        md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
          const token = tokens[idx]
          const info = token.info ? unescapeAll(token.info).trim() : ''
          const content = token.content

          if (info === 'pug parsed') {
            return this._pugConvert(content)
          } else if (info === 'yaml link') {
            return this._makeLink(yaml.safeLoad(content))
          }

          return fence!(tokens, idx, options, env, slf)
        }
        return md
      })
      .use(emoji)
      .use(imsize)
      .use(externalLinks, {
        externalTarget: '_blank',
        externalRel: 'noopener nofollow noreferrer'
      })
      .use(mdContainer, 'spoiler', {
        validate: (params: string) => {
          return params.trim().match(/^spoiler(?:\s+(.*))?$/)
        },
        render: (tokens: any[], idx: number) => {
          const m = tokens[idx].info.trim().match(/^spoiler(?:\s+(.*))?$/)

          if (tokens[idx].nesting === 1) {
            // opening tag
            return (
              '<details style="margin-bottom: 1rem;"><summary>' +
              this.md.utils.escapeHtml(m[1] || 'Spoiler') +
              '</summary>\n'
            )
          } else {
            // closing tag
            return '</details>\n'
          }
        }
      })

    this.pug = (p: string) =>
      pug.render(p, {
        filters: {
          markdown: (s: string) => this._mdConvert(s)
        }
      })
  }

  async render(s: string) {
    try {
      if (s.startsWith('---\n')) {
        s = s.substr(4).split(/---\n(.*)$/s)[1] || ''
      }

      this.html = this._mdConvert(s.replace(/<!--.*?-->/g, ''))
    } catch (e) {}

    const body = document.createElement('body')
    body.innerHTML = this.html

    body.querySelectorAll('style').forEach((el) => {
      el.innerHTML = stylis(`.${this.id}`, el.innerHTML)
    })

    body.querySelectorAll('iframe').forEach((el) => {
      const w = el.width
      const h = el.height

      el.style.width = w ? `${w}px` : ''
      el.style.height = h ? `${h}px` : ''
    })

    body.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightBlock(el)
    })

    await Promise.all(
      Array.from(body.querySelectorAll('img')).map(async (el) => {
        return localizeImage(el)
      })
    )

    const { features } = await getTheme()

    if (features?.lazyload !== false) {
      body.querySelectorAll('img, iframe').forEach((el) => {
        el.setAttribute('loading', 'lazy')
      })
    }

    return `<div class="${this.id}">${body.innerHTML}</div>`
  }

  private _pugConvert(s: string) {
    return this.pug(s)
  }

  private _mdConvert(s: string) {
    const html = this.md.render(s)
    return liquid.parseAndRenderSync(html)
  }

  private _makeLink(meta: any) {
    const imgPos = meta.imgPos || 'left'

    const img = `
    <img style="${
      imgPos === 'left'
        ? 'width: 100px; margin-right: 1em; height: auto;'
        : 'margin-bottom: 1em; width: 100%; height: auto;'
    }" ${
      meta
        ? meta.image
          ? `src="${encodeURI(meta.image)}" ` +
            `alt="${he.encode(meta.title || meta.url)}" `
          : ''
        : ''
    } />`

    const innerHTML = `${
      meta.image
        ? `
      <div style="${(imgPos === 'left'
        ? 'width: 100px; margin-right: 1em;'
        : '') +
        'display: flex; align-items: center; justify-content: center;' +
        'overflow: hidden;'}">${img}
      </div>`
        : ''
    }
      <div>
        ${
          meta.title
            ? `<h3 style="color: darkblue; margin-block-start: 0;">${he.encode(
                meta.title
              )}</h3>`
            : `<h6 style="color: darkblue; margin-block-start: 0;">${he.encode(
                meta.url
              )}</h6>`
        }
        ${he.encode(meta.description || '')}
      </div>`

    return `
    <a is="a-card" style="${`flex-direction: ${
      imgPos === 'left' ? 'row' : 'column'
    };` +
      'display: flex;' +
      'margin: 1em; padding: 1em;' +
      'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);'}" href="${encodeURI(
      meta.url
    )}"
    rel="noopener" target="_blank">
      ${innerHTML}
    </a>`
  }
}

function isUrl(s: string) {
  if (/^https?:\/\/[^ ]+$/.test(s)) {
    try {
      // eslint-disable-next-line no-new
      new URL(s)
      return true
    } catch (_) {}
  }

  return false
}

export const staticPath = (p: string) => path.join(__dirname, '../../static', p)

export function extractFilenameFromUrl(
  u: string,
  fallback: string,
  opts?: {
    preferredExt?: string[]
  }
) {
  try {
    const { pathname } = new URL(u)
    const unsafeFilename = decodeURIComponent(
      pathname.split('/').pop() || fallback
    )

    const safeFilename = sanitize(unsafeFilename)
    if (opts?.preferredExt && opts.preferredExt.length > 0) {
      const ext = (safeFilename.match(/\..+?$/) || [])[0]
      if (!ext || !opts.preferredExt.includes(ext)) {
        return safeFilename + opts.preferredExt[0]
      }
    }

    return safeFilename
  } catch (_) {}

  return fallback
}

const styleSizeToNumber = (s: string) => (s.endsWith('px') ? parseInt(s) : null)

export async function localizeImage(im: HTMLImageElement | string) {
  let src = ''
  let el: HTMLImageElement | null = null
  if (typeof im === 'string') {
    src = im
  } else {
    el = im
    src = im.getAttribute('src') || ''
  }

  if (src && isUrl(src)) {
    try {
      const { data } = await axios.get(src, {
        responseType: 'arraybuffer'
      })

      const newUrl = `media/${SparkMD5.ArrayBuffer.hash(
        data
      )}/${extractFilenameFromUrl(src, 'image.webp', {
        preferredExt: ['.webp']
      })}`

      await fs.ensureFile(staticPath(newUrl))
      await fs.writeFile(
        staticPath(newUrl),
        await sharp(data)
          .resize(
            (el ? el.width || styleSizeToNumber(el.style.width) : null) || 800,
            el ? el.height || styleSizeToNumber(el.style.height) : null,
            {
              withoutEnlargement: true
            }
          )
          .toFormat('webp', { quality: 80 })
          .toBuffer()
      )

      if (el) {
        el.setAttribute('src', `/${newUrl}`)
        el.setAttribute('data-original-src', src)
      }

      return newUrl
    } catch (_) {}
  }

  return null
}
