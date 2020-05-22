import hljs from 'highlight.js'
import hljsDefineVue from 'highlightjs-vue'

hljsDefineVue(hljs)

export function highlightBlock(parent: Element) {
  Array.from(parent.querySelectorAll('pre code:not(.hljs)')).forEach((el) => {
    hljs.highlightBlock(el)
  })
}
