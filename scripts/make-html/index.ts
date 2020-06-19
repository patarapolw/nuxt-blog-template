import he from 'he'
import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import mdContainer from 'markdown-it-container'
import emoji from 'markdown-it-emoji'
import imsize from 'markdown-it-imsize'
import externalLinks from 'markdown-it-external-links'
import { unescapeAll } from 'markdown-it/lib/common/utils'
import pug from 'pug'
import stylis from 'stylis'
import hljs from 'highlight.js'
import hljsDefineVue from 'highlightjs-vue'

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
          } else if (info === 'css parsed') {
            return this._makeCss(content)
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
          markdown: (s: string) => this._mdConvert(s),
          css: (s: string) => this._makeCss(s)
        }
      })
  }

  render(s: string) {
    try {
      if (s.startsWith('---\n')) {
        s = s.substr(4).split(/---\n(.*)$/s)[1] || ''
      }

      this.html = this._mdConvert(s.replace(/<!--.*?-->/g, ''))
    } catch (e) {}

    return this.html
  }

  private _pugConvert(s: string) {
    return this.pug(s)
  }

  private _mdConvert(s: string) {
    let html = this.md.render(s)
    html = liquid.parseAndRenderSync(html)

    const body = document.createElement('body')
    body.innerHTML = html

    body.querySelectorAll('iframe').forEach((el) => {
      const w = el.width
      const h = el.height

      el.style.width = w ? `${w}px` : ''
      el.style.height = h ? `${h}px` : ''
    })

    body.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightBlock(el)
    })

    return `<div class="${this.id}">${body.innerHTML}</div>`
  }

  private _makeCss(s: string) {
    return `<style>${stylis(`.${this.id}`, s.replace(/\s+/gs, ' '))}</style>`
  }

  private _makeLink(meta: any) {
    const imgPos = meta.imgPos || 'left'

    const img = `
    <img style="${
      imgPos === 'left'
        ? 'max-width: 200px; margin-right: 1em; width: 100%; height: auto;'
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
        ? 'max-width: 200px; margin-right: 1em;'
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
