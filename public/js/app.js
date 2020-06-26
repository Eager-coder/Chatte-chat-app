const socket = io()
const getRoomName = () => {
    return window.location.search.split('=')[1]
}

const messageContainer = document.querySelector('.message-container')
socket.emit('join', getRoomName())
socket.on('message', message => {
    const div = document.createElement('div')
    div.className = 'message-from'
    div.innerText = message.message
    messageContainer.appendChild(div)
})

const input = document.querySelector('input')
const button = document.querySelector('#send')
button.addEventListener('click', () => {
    if (input.value != '') {
        const sendingMessage = input.value
        const div = document.createElement('div')
        div.className = 'message'
        div.innerText = sendingMessage
        messageContainer.appendChild(div)
        socket.emit('sendMessage', sendingMessage)
        input.value = ''
    }
})
fetch('/chat').then(data => console.log(data))