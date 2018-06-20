import { handleRequest } from './requestHandler'
const wsUrl = 'ws://localhost:8601'

class persistentSocket {
  constructor(url, channel) {
    this.url = url
    this.channel = channel
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url)

    console.log(`Connecting websocket to: ${this.url}`)
    this.registerEvents()
  }

  registerEvents() {
    this.ws.onopen = () => {
      console.log('Websocket opened')
      if (this.reconnectInterval) {
        console.log('Clearing reconnect interval')
        clearInterval(this.reconnectInterval)
      }

      //this.ws.send(JSON.stringify({ 'getExtensions': true }));
      //chrome.browserAction.setIcon({ 'path': 'ap-16.png' })
    }

    this.ws.onmessage = async (e) => {
      if (e.data == 'ping') return

      let msg 
      try {
        msg = JSON.parse(e.data)
      } catch (err) {
        throw new Error('Invalid message unable to parse ' + msg + ' as json')
        return
      }

      const retObj = await handleRequest(msg)
      this.send(retObj)
    }

    //Change icon on failure
    this.ws.onerror = (err) => {
      console.log('error connecting websocket')
      console.log(err)

      //chrome.browserAction.setIcon({ 'path': 'ap-16-alert.png' }, function(err) {
      //  console.log(err)
      //})

      this.reconnect()
    }

    //Change icon on close
    this.ws.onclose = () => {
      console.log('Websocket has been closed.')

      //chrome.browserAction.setIcon({ 'path': 'ap-16-alert.png' }, function(err) {
      //  console.log(err)
      //})

      this.reconnect()
    }
  }

  reconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
    }
    this.reconnectInterval = setInterval(this.connect.bind(this), 750)
  }

  send(msg) {
    
    try {
      this.ws.send(typeof msg == 'object' ? JSON.stringify(msg) : msg)
    } catch (err) {
      console.log(err)
    }
  }
}

const ws = new persistentSocket(wsUrl)

setInterval(function() {
  null
  //console.log('Required to keep background page open')
}, 5000)

export { ws }
