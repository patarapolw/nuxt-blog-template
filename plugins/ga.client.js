export default ({ app }) => {
  window.dataLayer = window.dataLayer || []
  function gtag() {
    // eslint-disable-next-line no-undef
    dataLayer.push(arguments)
  }

  app.router.afterEach((to) => {
    gtag('js', new Date())
    gtag('config', 'UA-168046128-1', { page_path: to })
  })
}
