import HyperPug from 'hyperpug'
import stylis from 'stylis'
import hljs from 'highlight.js'
import hljsDefineVue from 'highlightjs-vue'
import MarkdownIt from 'markdown-it'
import { unescapeAll } from 'markdown-it/lib/common/utils'
import emoji from 'markdown-it-emoji'
import imsize from 'markdown-it-imsize'
import mdContainer from 'markdown-it-container'
import he from 'he'
import yaml from 'js-yaml'
import cheerio from 'cheerio'

import { liquid } from './template'

hljsDefineVue(hljs)

export default class MakeHtml {
  md: MarkdownIt
  hp: HyperPug

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

    this.hp = new HyperPug({
      markdown: (s) => this._mdConvert(s),
      css: (s) => this._mdConvert(s)
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

  private _prerender(s: string) {
    return liquid.parseAndRenderSync(s)
  }

  private _postrender(html: string) {
    const $ = cheerio.load(`<div class="${this.id}">${html}</div>`)

    $('iframe').each((_, el) => {
      const $el = $(el)

      const w = $el.attr('width')
      const h = $el.attr('height')

      $el.css({
        width: w ? `${w}px` : undefined,
        height: w ? `${h}px` : undefined
      })
    })

    $('pre code').each((_, el) => {
      const $el = $(el)

      const lang = ($el.attr('class') || '')
        .split(' ')
        .filter((cl) => cl.startsWith('language-'))
        .map((cl) => cl.split('-')[1])[0]
      if (lang) {
        const html = $el.text() || ''
        try {
          $el.html(hljs.highlight(lang, html).value)
        } catch (_) {}
      }
    })

    return `<div class="${this.id}">${$(`.${this.id}`).html()}</div>`
  }

  private _pugConvert(s: string) {
    return this.hp.parse(s)
  }

  private _mdConvert(s: string) {
    const html = this.md.render(s)
    return this._postrender(this._prerender(html))
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