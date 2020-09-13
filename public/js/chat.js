const socket = io()

// DOM elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormSendButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#message-location')
const $messageScreen = document.querySelector('#messageScreen')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message',(messageObj)=>{
    // console.log(messageObj)
    const html = Mustache.render(messageTemplate, {
        username : messageObj.username,
        message : messageObj.message,
        createdAt : moment(messageObj.createdAt).format('h:mm a')
    })
    $messageScreen.insertAdjacentHTML('beforeend', html)
    $messageScreen.scrollTop = $messageScreen.scrollHeight
})

socket.on('information', (message)=>{
    console.info(message)
})

socket.on('location',(location)=>{
    console.log(`https://google.com/maps?q=${location.latitude},${location.longitude}`)
})

socket.on('roomData', ({room, users}) =>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(event)=>{
    event.preventDefault()
    $messageFormSendButton.setAttribute('disabled', 'disabled')
    const message = event.target.elements['message-input'].value
    $messageFormInput.value = ''
    $messageFormInput.focus()
    socket.emit('messageServer', message, (delivered) => {
        $messageFormSendButton.removeAttribute('disabled')
        if (delivered) {
            console.warn('Message delivered successfully')
        } else {
            console.error('Message not delivered ');
        }
    })
})

$locationButton.addEventListener('click',()=>{
    $locationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert("Your browser doesn't support sharing location")
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    })   
})

socket.emit('join', {username, room}, (error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})
