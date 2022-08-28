const port = require('worker_threads').parentPort
const { fetch } = require('undici')
const currentlyFetching = {}
port.on('message', async ({ type, ...rest }) => {
  if (type === 'fetch') {
    const url = rest.value.url
    if (currentlyFetching[url]) return
    currentlyFetching[url] = true
    const response = await (await fetch(rest.value.url)).json()
    port.postMessage({ type: 'fetch', value: { url, response } })
    if (!response.ok) console.log('!ok: ', url)
    delete currentlyFetching[url]
  }
})
