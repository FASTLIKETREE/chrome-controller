console.log('do we see this at all?')
let s = { reconnect: true }

setInterval(function() {
  if (s.reconnect == false) {
    return
  }

  s = new WebSocket("ws://localhost:8081");

  s.onerror = function(e) {
    console.log(`onerror ${e}`)
    s.reconnect = true
  }

  s.onopen = function(e) {
    console.log(`onopen ${e}`)
    s.reconnect = false 
  }

  let tabId = 99999
  s.onmessage = function(msg) {
    console.log(msg)
    if (msg.data == 'refresh') {
      console.log('we HAVE GOTTEN A FRESHES YESS!')
      chrome.tabs.get(tabId, function(tab) {
        console.log(tab)
        console.log(typeof tab)
        if (typeof tab == 'undefined') {
          chrome.tabs.query({}, function(tabArray) {
            for (tab of tabArray) {
              if (tab.url.indexOf('capture.html') != -1) {

                console.log('Cacheing tabId ' + tab.id);
                tabId = tab.id
                break
              }
              console.log(JSON.stringify(tab, null, 4))
            }
          })
        }
      });
      console.log('Refreshing tab ' + tabId)
      chrome.tabs.reload(tabId)
    }
    console.log('we can refresh the page now')
  }
}, 1000)
