import watch from 'node-watch'
import rp from 'request-promise'
import fileUrl from 'file-url'

const watchFile = '../card-builder/card.html'
const watchFileUrl = fileUrl(watchFile)

const extensionServer = 'http://localhost'
const extensionServerPort = 9250
const extensionUrl = `${extensionServer}:${extensionServerPort}`

console.log(extensionUrl)

let tabId

async function callChromeApi(fn, args) {
  const reqBody = { fn, args }

  const options = {
    method: 'POST',
    uri: `${extensionUrl}/generic`,
    body: reqBody,
    json: true
  }
  
  return rp(options)
}

async function initialize() {
  console.log('Initializing tab')
  const tab = await callChromeApi('chrome.tabs.create', [{ url: watchFileUrl }])
  tabId = tab.id
}


watch(watchFile, { recursive: true }, async function(evt, name) {
  if (!tabId) {
    throw new Error('tab has not been initialized')
  }

  let reload = await callChromeApi('chrome.tabs.reload', [tabId, {}])
  let capture = await callChromeApi('chrome.tabs.captureVisisbleTab', [tabId, { format: 'png' }])
})

initialize()
