const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const {customizeMessage} = require('./utils/messages.js')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js') 

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, './public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('connection established')
    socket.on('join', ({ username, room}, callback) => {
        const { error, user } = addUser({id: socket.id, username, room})

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',customizeMessage('GupShup - Admin', `Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('message', customizeMessage('GupShup - Admin',`${user.username} has joined the room!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendLocation', (location)=>{
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('location', location)
    })

    socket.on('messageServer',(clientMessage, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('message', customizeMessage(user.username, clientMessage))
        callback(true)
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message',customizeMessage('GupShup - Admin',`${user.username} has left the room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`server started at ${port}`)
})

















