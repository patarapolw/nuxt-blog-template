import Vue from 'vue'
import { library, config } from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faCaretRight,
  faCaretLeft,
  faAt
} from '@fortawesome/free-solid-svg-icons'
import {
  faTwitter,
  faFacebookF,
  faInstagram,
  faGithub,
  faReddit,
  faQuora
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

config.autoAddCss = false

library.add(
  faSearch,
  faCaretRight,
  faCaretLeft,
  faAt,
  faTwitter,
  faFacebookF,
  faInstagram,
  faGithub,
  faReddit,
  faQuora
)

Vue.component('fa', FontAwesomeIcon)
