
const apiQueue = {}
let reloadSync
let eventsRegistered = 0

async function handleRequest(data) {
  const { uuid, body } = data
  let { tabId, fn, args } = body
  console.log(fn)

  if (fn == 'chrome.tabs.create' && !eventsRegistered) {
    eventsRegistered = 1
    console.log('We are adding the onUpdate listener')
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

      console.log(tabId)
      console.log(changeInfo)
      console.log(apiQueue)
      console.log('we are firing the updated listener, this should wait to capture until this gets hit after a reload..')
      if (reloadSync) {
        console.log(reloadSync)
        reloadSync.resolve(reloadSync.data)
        reloadSync = undefined
      }
    })
  }
  return callChromeApi(uuid, fn, args)
}

function callChromeApi(uuid, fn, args, promise) {
  console.log('callChromeApi')
  console.log(uuid)
  console.log(fn)
  console.log(args)
  
  const retPromise = new Promise(function(resolve, reject) {
    const finalArgs = [...args, function (returnData) { 
      if (fn == 'chrome.tabs.reload') {
        reloadSync = { resolve, data: { uuid, data: returnData || [] } }
      } else {
        resolve({ uuid, data: returnData || [] })
      }
    }]

    //const finalArgs = [...args, function chromeCallback(a, b, c) { 
    //  let returnData = a || []
    //  resolve({ uuid, data: returnData })
    //}]

    eval(fn).apply(this, finalArgs)
  })
  return retPromise
}

export { handleRequest }
