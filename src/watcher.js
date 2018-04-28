import watch from 'node-watch'
import rp from 'request-promise'
import fileUrl from 'file-url'

const watchFile = '../card-builder/card.html'

//request('http://localhost:9250/testme', function (error, response, body) {
//  console.log('error:', error); // Print the error if one occurred
//  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//  console.log('body:', body); // Print the HTML for the Google homepage.
//})

//const extensionServer = 'http://127.0.0.1'
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
  
  //const reqBody = { func, args : JSON.stringify(args) }
  const reqBody = { fn, args }

  console.log('BELOW IS THE URL?')
  console.log(reqBody)
  console.log(`${extensionUrl}/generic`)
  const options = {
    method: 'POST',
    uri: `${extensionUrl}/generic`,
    body: reqBody,
    json: true
  }
  console.log(options)
  //rp(options).then(function() {
  //  console.log('WE GOT SOMETHING OR NOT?')
  //})

  //console.log('WE ARE DOING GET #2!')
  //const options2 = {
  //  method: 'GET',
  //  uri: `${extensionUrl}/generic`,
  //  headers: {
  //    Connection: 'keep-alive',
  //  }
  //}
  //rp(options2).then(function() {
  //  console.log('WE GOT SOMETHING OR NOT?')
  //})

  //rp('http://localhost:9250/test')
  //  .then(function (htmlString) {
  //    console.log('whatever')
  //    console.log(htmlString)
  //      // Process html...
  //  })
  //  .catch(function (err) {
  //    console.log('whatever ERROR')
  //    console.log(err)
  //      // Crawling failed...
  //  });


  
  
  const tab = await rp(options)
  tabId = tab.id
  console.log('Tab has been initialized')
  console.log(tab)
}


//watch(watchFile, { recursive: true }, async function(evt, name) {
//  if (!tabId) {
//    console.log('tab has not been initialized')
//  }
//
//  console.log(evt)
//  console.log(name)
//
//  const func = 'chrome.tabs.update'
//  const args = []
//  args.push(tabId)
//
//  const reqBody = { func, args }
//
//  const options = {
//    method: 'POST',
//    uri: extensionUrl,
//    body: JSON.stringify(reqBody),
//    json: true
//  } 
//  const tab = await rp(options)
//  
//  console.log(tab)
//  console.log('THE WATCHFILE THINGY HAS RUN, DID IT DO ANYTING?')
//})

initializeTab()
