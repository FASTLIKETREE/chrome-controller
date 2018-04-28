import ChromePromise from 'chrome-promise'

const pChrome = new ChromePromise()

async function handleRequest(data) {
  console.log('below is the data!')
  console.log('below is the data! DOES THIS GET RELOADED?')
  console.log(data)
  const { uuid, body } = data
  console.log('below is the data! DOES THIS GET RELOADED?')
  console.log(uuid)
  console.log(body)
  console.log('below is the data! DOES THIS GET RELOADED?')
  let { fn, args } = body
  console.log('below is the fn!')
  console.log(fn)

  console.log('uuid string -> ' + uuid)
  console.log(body)
  //const splitFn = fn.split('.')
  //let res
  //if (fn == "chrome.tabs.create") {
  //  res = await pChrome.tabs.create.apply(null, args)
  //}

  const promiseFn = fn.replace('chrome', 'pChrome')

  //console.log(`${fn}.apply(null, ${JSON.stringify(args)})`)
  //let res = await eval(`${fn}.apply(null, ${JSON.stringify(args)})`)

  console.log(`${promiseFn}.apply(null, ${JSON.stringify(args)})`)
  let returnData = await eval(`${promiseFn}.apply(null, ${JSON.stringify(args)})`)

  console.log(returnData)
  console.log('about to return out of handleRequest!')
  return { uuid, data: returnData }
}

//  let tabId = 99999
//  s.onmessage = function(msg) {
//    console.log(msg)
//    if (msg.data == 'refresh') {
//      console.log('we HAVE GOTTEN A FRESHES YESS!')
//      chrome.tabs.get(tabId, function(tab) {
//        console.log(tab)
//        console.log(typeof tab)
//        if (typeof tab == 'undefined') {
//          chrome.tabs.query({}, function(tabArray) {
//            for (tab of tabArray) {
//              if (tab.url.indexOf('capture.html') != -1) {
//
//                console.log('Cacheing tabId ' + tab.id);
//                tabId = tab.id
//                break
//              }
//              console.log(JSON.stringify(tab, null, 4))
//            }
//          })
//        }
//      });
//      console.log('Refreshing tab ' + tabId)
//      chrome.tabs.reload(tabId)


export { handleRequest }
