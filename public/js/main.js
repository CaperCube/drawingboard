
import { io } from "./dist/socket.io.esm.min.js"

//////////////////////////////////////////////////
// Wallpaper Engine stuff
//////////////////////////////////////////////////
let serverURL = ''
let socket = null

function TryToConnect(url = '') {
    if (socket) {
        socket.disconnect()
        socket = null
    }
    socket = io.connect(serverURL, {
        reconnection: true,
        timeout: 1000
    })
    $('#status').textContent = `Trying to connect to ${url} ...`

    // Apply new listeners
    socket.on('connect_error', (err) => {
        console.log(err)
        $('#status').textContent = err
    })
    socket.on('connect_failed', (err) => {
        console.log(err)
        $('#status').textContent = err
    })
    socket.on('disconnect', (err) => {
        $('#status').textContent = 'Disconnected'
        console.log(err)
    })
    socket.on('connect', (err) => {
        if (err) console.log(err)
        $('#status').textContent = 'Connected'
        // Set heartbeat ping (this will ensure the client goes back to the menu if the connection fails / ends)
        socket.pingTimeout = 1000
        socket.pingInterval = 500
    })

    // Redraw canvas on net update
    socket.on('syncCanvas', (data) => {
        appShapes = data.shapes
        ClearBake()
        DrawCanvas()

        $('#status').textContent = 'Synced'
    })

    // Update user list
    socket.on('updateUserList', (data) => {
        //...
    })
}

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.serverurl) {
            serverURL = properties.serverurl.value || ''
            // Connect to this server
            TryToConnect(serverURL)
        }
    },
}

//////////////////////////////////////////////////
// Classes
//////////////////////////////////////////////////

class Shape {
    constructor(color = '#000000', size = 3, points = [0, 0]) {
        this.color = color
        this.size = size
        this.points = points
    }
}

//////////////////////////////////////////////////
// Canvas / App vars
//////////////////////////////////////////////////
const canvas = $('#main-canvas')
const ctx = canvas.getContext('2d')
const renderScale = 0.75
const cWidth = 1920 * renderScale
const cHeight = 1080 * renderScale
canvas.width  = cWidth
canvas.height = cHeight

const bgColor = '#000000'
ctx.lineCap = "round"
ctx.lineJoin = "round"

let allowDrawing = false
let penSize = 2
let penColor = '#888888'
let penDown = false

let appShapes = []
let wetShape = null // { color: '#000000', size: 3, points: [x,y, x,y, ...] }

let bakedShapeLayer = null

//////////////////////////////////////////////////
// Canvas functions
//////////////////////////////////////////////////

// Draw all shapes
function ClearCanvas() {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function ClearBake() {
    bakedShapeLayer = null
    // ClearCanvas()
}

// Draw all shapes
function DrawShapes(shapes) {
    for (const shape of shapes) {
        DrawShape(shape)
    }
}

function DrawShape(shape) {
    // Start shape
    ctx.beginPath()
    ctx.strokeStyle = shape.color
    ctx.lineWidth = shape.size
    ctx.moveTo(shape.points[0], shape.points[1])

    // Create segments
    if (shape.points.length > 2) {
        for (let p = 2; p < shape.points.length; p+=2) {
            const x = shape.points[p]
            const y = shape.points[p+1]

            // Draw segment
            ctx.lineTo(x, y)
        }
    }
    else {
        // Draw small point
        ctx.lineTo(shape.points[0] + shape.size, shape.points[1] + shape.size)
    }

    // Finish shape
    ctx.stroke()
}

// Draw all layers
function DrawCanvas() {
    // Clear all graphics
    ClearCanvas()

    // Draw other shapes
    if (bakedShapeLayer) {
        // Draw baked layer
        ctx.drawImage(bakedShapeLayer, 0, 0)
    }
    else if (appShapes) {
        // Draw shapes
        DrawShapes(appShapes)

        // Store baked canvas
        const src = canvas.toDataURL('image/png')
        bakedShapeLayer = new Image()
        bakedShapeLayer.src = src
    }

    // Draw wet paint
    if (wetShape) {
        DrawShape(wetShape)
    }
}

ClearCanvas()

//////////////////////////////////////////////////
// Net Coms
//////////////////////////////////////////////////

// Estabolish a connection
if (!socket) {
    TryToConnect(serverURL)
}

//////////////////////////////////////////////////
// Event listeners
//////////////////////////////////////////////////

// Get mouse pos
function GetPenPosition(e) {
    const wRatio = canvas.width / window.innerWidth
    const hRatio = canvas.height / window.innerHeight
    const mPos = {
        x: e.clientX * wRatio,
        y: e.clientY * hRatio
    }

    return mPos
}

// Down
canvas.addEventListener('pointerdown', (e)=>{
    penDown = true

    // Add first point to wet paint
    if (allowDrawing) {
        const mPos = GetPenPosition(e)
        wetShape = new Shape(penColor, penSize, [mPos.x, mPos.y])

        // Redraw canvas
        DrawCanvas()
    }
})

// Move
canvas.addEventListener('pointermove', (e)=>{
    // Add point to wet paint
    if (penDown && wetShape) {
        const mPos = GetPenPosition(e)

        wetShape.points.push(mPos.x)
        wetShape.points.push(mPos.y)

        // Redraw canvas while drawing
        DrawCanvas()
    }
})

// Up
canvas.addEventListener('pointerup', (e)=>{
    penDown = false

    if (wetShape) {
        // Network shape & clear
        $('#status').textContent = 'Attempting draw...'
        socket.emit('drawShape', { shape: wetShape })
        wetShape = null

        // Redraw canvas on draw finish
        DrawCanvas()
    }
})


//////////////////////////////////////////////////
// Buttons
//////////////////////////////////////////////////

$('#color-white').onclick = (e) => { penColor = '#888888' }
$('#color-red').onclick = (e) => { penColor = '#ee6666' }
$('#color-green').onclick = (e) => { penColor = '#66aa66' }
$('#color-blue').onclick = (e) => { penColor = '#6666ee' }

$('#draw-mode').onclick = (e) => {
    allowDrawing = !allowDrawing

    if (allowDrawing) {
        e.target.textContent = 'Drawing On'
    }
    else {
        e.target.textContent = 'Drawing Off'
    }
}

$('#clear').onclick = (e) => {
    $('#status').textContent = 'Attempting clear...'
    socket.emit('clearBoard')
}
$('#refresh').onclick = (e) => {
    $('#status').textContent = 'Attempting refresh...'
    socket.emit('resync')
}

$('#reconnect').onclick = (e) => { TryToConnect(serverURL) }
