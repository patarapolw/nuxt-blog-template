/* eslint-disable camelcase */
const remark_config = JSON.parse(process.env.remark42Config)

;(function(c) {
  for (let i = 0; i < c.length; i++) {
    const d = document
    const s = d.createElement('script')
    s.className = 'remark42-script'
    s.src = remark_config.host + '/web/' + c[i] + '.js'
    s.defer = true
    ;(d.head || d.body).appendChild(s)
  }
})(['embed'])
