import watch from 'node-watch'
import rp from 'request-promise'
import fileUrl from 'file-url'

const watchFile = '../card-builder/card.html'

const extensionServer = 'http://localhost'
const extensionServerPort = 9250
const extensionUrl = `${extensionServer}:${extensionServerPort}`

console.log(extensionUrl)

let tabId

async function initializeTab() {
  const cardUrl = fileUrl(watchFile)
  const tabOptions = { url: cardUrl }

  const fn = 'chrome.tabs.create'
  const args = []
  args.push(tabOptions)
  
  const reqBody = { fn, args }

  const options = {
    method: 'POST',
    uri: `${extensionUrl}/generic`,
    body: reqBody,
    json: true
  }
  
  const tab = await rp(options)
  tabId = tab.id
  console.log('Tab has been initialized')
}


watch(watchFile, { recursive: true }, async function(evt, name) {
  if (!tabId) {
    throw new Error('tab has not been initialized')
  }

  console.log(evt)
  console.log(name)

  const fn = 'chrome.tabs.reload'
  const args = []
  args.push(tabId)
  args.push({})

  const reqBody = { fn, args }

  const options = {
    method: 'POST',
    uri: `${extensionUrl}/generic`,
    body: reqBody,
    json: true
  } 

  const tab = await rp(options)
})

initializeTab()
