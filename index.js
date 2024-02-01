////////////////////////////////////////
// required packages
////////////////////////////////////////
const express = require('express')
const { SocketAddress } = require("net")
require('dotenv/config')
const port = process.env.PORT || 3000

// Server communication
const app = express()
const serv = require('http').Server(app)
const io = require('socket.io')(serv,{})

////////////////////////////////////////
// Server setup
////////////////////////////////////////
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname + '/public'))

////////////////////////////////////////
// Constants
////////////////////////////////////////
const maxShapes = process.env.MAX_SHAPES || 1000
let storedShapes = []

////////////////////////////////////////
// Socket Connection
////////////////////////////////////////
let SOCKET_LIST = {}

io.sockets.on('connection', function(socket) {
    // When a user connects to the server
    // Give the connection a unique ID and store it
    socket.ID = Math.random()
    SOCKET_LIST[socket.ID] = socket

    // Send welcome packet
    SyncNewUser(socket)
    console.log(`Welcome ${socket.ID}!`)

    ///////////////////////////////////////
    // Client to Server messages
    ///////////////////////////////////////

    socket.on('drawShape', (data) => {
        // Store this shape
        StoreShape(data.shape)
        console.log(`${socket.ID} added a shape`)
    })

    socket.on('clearBoard', (data) => {
        // Erase all and resync
        storedShapes = []
        SyncCanvasForAll()
    })

    socket.on('resync', (data) => {
        SyncNewUser(socket)
    })

    ///////////////////////////////////////
    // On user leave
    ///////////////////////////////////////

    socket.on('disconnect', function(){
        // Remove player (if applicable)
        delete SOCKET_LIST[socket.ID]
    })
})

///////////////////////////////////////
// Server Code
///////////////////////////////////////

// New user sync
function SyncNewUser(socket) {
    socket.emit("syncCanvas", { shapes: storedShapes })
    socket.emit("updateUserList", { userCount: Object.keys(SOCKET_LIST).count })
}

// Send data to all
function SyncCanvasForAll() {
    // Loop through all connections and send this server message
    for (var sID in SOCKET_LIST) {
        // If the socket is not mine
        SOCKET_LIST[sID].emit('syncCanvas', { shapes: storedShapes })
    }
}

// Store and send drawing data
function StoreShape(shape) {
    // Add shape to list
    storedShapes.push(shape)
    if (storedShapes.length > maxShapes) {
        storedShapes.shift()
    }

    // Update all users with new shape
    SyncCanvasForAll(shape)
}

///////////////////////////////////////
// Server started
///////////////////////////////////////

// listen for requests
serv.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m', `Server has started!`)
    console.log(`Now listening for connections on port ${port}`)
    console.log(`App: http://localhost:${port}/index.html`)
})
