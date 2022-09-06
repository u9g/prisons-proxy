import { parentPort } from 'worker_threads'
// const port = require('worker_threads').parentPort
import { fetch } from 'undici'
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const port = parentPort!
const currentlyFetching = new Map()
// eslint-disable-next-line @typescript-eslint/no-misused-promises
port.on('message', async ({ type, ...rest }) => {
  if (type === 'fetch') {
    const url = rest.value.url
    if (currentlyFetching.has(url)) return
    currentlyFetching.set(url, true)
    try {
      const response = await (await fetch(rest.value.url)).json()
      port.postMessage({ type: 'fetch', value: { url, response } })
      // if (!response.ok) console.log('!ok: ', url)
    } catch (e) {
      console.log(url, e)
    } finally {
      currentlyFetching.delete(url)
    }
  }
})
