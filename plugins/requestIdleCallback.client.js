window.requestIdleCallback =
  window.requestIdleCallback ||
  function(cb) {
    const start = Date.now()
    return setTimeout(function() {
      // eslint-disable-next-line standard/no-callback-literal
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start))
        }
      })
    }, 1)
  }

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function(id) {
    clearTimeout(id)
  }
