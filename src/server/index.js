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
  console.log('we are in middleware something sould print?')
  next()
})

app.post('/generic', (req, res) => {
  console.log('we got a request BUM BUM BUM!')
  const uuid = uuidv1()
  console.log(uuid)
  reqSocketMap[uuid] = { req, res, uuid }
  socket.broadcast(JSON.stringify({ uuid : uuid, body: req.body }))
})

socket.on('connection', function connection(ws) {
  console.log('Connection received.')

  ws.on('message', (msg) => {
    const parsedMsg = JSON.parse(msg)
    console.log('WE SHOULD GET AN ID HERE AND COMPLETE THE REQUEST WOOHOO')
    console.log('received: %s', msg);
    console.log('below is msg!');
    console.log(parsedMsg);
  
    const { res } = reqSocketMap[parsedMsg.uuid]
    res.status(200).send(parsedMsg.data)
  })

  ws.on('error', (err) => {
    console.log(err)
  })
  //ws.send('something');
})


//app.post('/refresh', (req, res) => {
//  console.log('we are going torefrehs now?')
//  socket.broadcast('refresh')
//  res.sendStatus(204)
//})

socket.broadcast = function broadcast(data) {
  socket.clients.forEach(function each(client) {
    //console.log(client + '<-- this is the client')
    if (client.readyState === ws.OPEN) {
      console.log(client.readyState + '<-- this is the client ready state')
      client.send(data)
    }
  })
}

//setInterval(function () {
//  socket.broadcast('ping')
//}, 30000)
