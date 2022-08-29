const port = require('worker_threads').parentPort
const { fetch } = require('undici')
const currentlyFetching = {}
port.on('message', async ({ type, ...rest }) => {
  if (type === 'fetch') {
    const url = rest.value.url
    if (currentlyFetching[url]) return
    currentlyFetching[url] = true
    try {
      const response = await (await fetch(rest.value.url)).json()
      port.postMessage({ type: 'fetch', value: { url, response } })
      if (!response.ok) console.log('!ok: ', url)
    } catch (e) {
      console.log(url, e)
    } finally {
      delete currentlyFetching[url]
    }
  }
})
