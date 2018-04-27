import express from 'express'
import bodyParser from 'body-parser'
import ws from 'ws'

const app = express()
app.listen(8080)
console.log('server listening on 8080')

app.use(bodyParser.json())
  
const socket = new ws.Server({ port: 8081 });
console.log('socket listening on 8081')

socket.on('connection', function connection(ws) {
  console.log('WE HAVE GOTTEN A CONNECTION WOOHOO')

  //ws.on('message', function incoming(message) {
  //console.log('received: %s', message);
  //});

  //ws.send('something');
});

app.post('/refresh', (req, res) => {
  console.log('we are going torefrehs now?')
  socket.broadcast('refresh')
  res.sendStatus(204)
})

socket.broadcast = function broadcast(data) {
  socket.clients.forEach(function each(client) {
    console.log(client + '<-- this is the client')
    if (client.readyState === ws.OPEN) {
      console.log(client.readyState + '<-- this is the client ready state')
      client.send(data);
    }
  });
}

setInterval(function () {
  socket.broadcast('ping')
}, 30000)
