import express from 'express'
import bodyParser from 'body-parser'
import ws from 'ws'
import uuidv1 from 'uuid/v1'

//const serverPort = 8600
const serverPort = 9250
const socketPort = 8601
const reqSocketMap = {}

const app = express()

app.listen(serverPort)
app.use(bodyParser.json())
  
const socket = new ws.Server({ port: 8601 })
console.log(`server listening on ${serverPort}`)
console.log(`server listening on ${socketPort}`)

app.use(function(req, res, next) {
  //console.log(req.body)
  next()
})

app.post('/generic', (req, res) => {
  const uuid = uuidv1()
  console.log(req.body)
  reqSocketMap[uuid] = { req, res, uuid }
  socket.broadcast(JSON.stringify({ uuid, body: req.body }))
})

socket.on('connection', function connection(ws) {
  console.log('Connection received.')

  ws.on('message', (msg) => {
    try {
      console.log('received: %s', msg)
      const parsedMsg = JSON.parse(msg)
      //console.log(parsedMsg)
    
      const { res } = reqSocketMap[parsedMsg.uuid]
      res.status(200).send(parsedMsg.data)
    }
    catch (err) {
      console.log('Invalid JSON message recieved')
      console.log(err)
    }
  })

  ws.on('error', (err) => {
    console.log(err)
  })
})

socket.broadcast = function broadcast(data) {
  socket.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data)
    }
  })
}

setInterval(function () {
  socket.broadcast('ping')
}, 30000)
