const searchPeopleBtn = document.getElementById('search-name-btn')
const searchContainer = document.querySelector('.search-container')
const searchPeopleInput = document.getElementById('searchName')
searchPeopleInput.addEventListener('input', () => {
    const searchName = searchPeopleInput.value.trim()
    if (searchName !== '') {
        console.log(searchName)
        fetch('/main/search', {
            method: 'POST',  
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: searchName })
        })
            .then(res => res.json())
            .then(data => renderSearchedUser(data))
            .catch(err => console.log(err))
    }
})

const renderSearchedUser = (data) => {
    console.log(data)
    const userContainer = document.querySelector('.user-container')
    if (data.hasOwnProperty('message')) {
        userContainer.innerHTML = `<span>${data.message}</span>`
    } else {
        userContainer.innerHTML = `
        <div class="searched-user">
            <img src="${data.searchedUser.avatar}"/> 
            <div>${data.searchedUser.name} <br> 
                <div class="chat-start-btn" id="${data.searchedUser.email}">Chat now</div>
            </div>
        </div>`
        document.querySelector('.chat-start-btn').dataset.name = data.searchedUser.name
        document.querySelector('.chat-start-btn').dataset.avatar = data.searchedUser.avatar
    }
}
const socket = io()
window.addEventListener('click', (e) => {
    if (e.target.className === 'chat-start-btn') {
        const name = e.target.dataset.name
        const avatar = e.target.dataset.avatar
        messageContainer.innerHTML = ''
        fetch(`/connect/${e.target.id}`)
            .then(res => res.json())
            .then(data => {
                    socket.emit('join', data.roomName)
                    socket.on('message', message => {
                    const div = document.createElement('div')
                    div.className = 'message-from'
                    div.innerHTML = `
                        <div class="message-info">
                            <img class="message-avatar" src="${avatar}"/> 
                            <span>${name}</span> 
                        </div>
                        <p>${message.message}</p>`
                    messageContainer.appendChild(div)
                })
            })
        e.target.remove()
    }
})




const messageContainer = document.querySelector('.message-container')


const messageInput = document.querySelector('#message-input')
const messageBtn = document.querySelector('#send-btn')
messageBtn.addEventListener('click', () => {
    if (messageInput.value.trim() !== '') {
        addMessage()
    }
})
input.addEventListener('keypress', (e) => {
    if (e.key == "Enter") {
        if (input.value.trim() !== '') {
            addMessage()
        }
    }
})

const addMessage = () => {
    const sendingMessage = messageInput.value
    const div = document.createElement('div')
    div.className = 'message'
    div.innerText = sendingMessage
    messageContainer.appendChild(div)
    socket.emit('sendMessage', sendingMessage)
    messageInput.value = ''
}