const express = require('express');
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const ejs = require('ejs')
const mongoose = require('mongoose')
const User = require('./models/User')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash');
const session = require('express-session')
const uniqid = require('uniqid')
// Setting Express 
const app = express()
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }))
app.use(session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Setting Ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/public/views'));
const expressLayouts = require('express-ejs-layouts')
app.use(expressLayouts)

// DB config
const db = process.env.MONGO_URI

//Connect to Mongo
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

// Passport config
require('./config/passport')(passport)
const { ensureAuthenticated } = require('./config/auth')

// Passport middleweare
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('welcome.ejs')
})

app.get('/main', ensureAuthenticated, (req, res) => {
    res.render('index.ejs', { username: req.user.username, avatar: req.user.avatar })
})

app.post('/main/search', ensureAuthenticated, (req, res) => {
    User.find({ username: req.body.name }, (err, user) => {

        if (user.length) {
            res.send({ 
                searchedUser: {
                    name: user[0].username, 
                    email: user[0].email, 
                    avatar: user[0].avatar
                },
                originUser: {
                    name: req.user.username,
                    email: req.user.email,
                    avatar: req.user.avatar,
                }
            })
        } else {
            res.send({message: 'No such user'})
        }
    })
})

// Login/Signup requests 
app.get('/account/register', (req, res) => {
    res.render('register.ejs')
})

app.get('/account/login', (req, res) => {
    res.render('login.ejs')
})

app.get('/account/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/account/login');
  });

app.post('/account/register', (req, res) => {
    const { username, email, password, password2 } = req.body

    // Password confirmation
    if (password !== password2) {
        res.render('register', { error: 'Passwords must match', username, email, password, password2})
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    req.render('register', {error: 'Email is already registered', username, email, password, password2 })
                } else {
                    const newUser = new User({ username, email, password })
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if (error) {
                            throw error
                        } else {
                            newUser.password = hash
                            newUser.save()
                                .then(user => {
                                    res.redirect('/account/login')                    
                                })
                                .catch(err => console.log(err))      
                        } 
                    }))
                }
            })
            .catch(err => console.log(err))
    }
})

app.post('/account/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/main',
        failureRedirect: '/account/login',
        failureFlash: true
    })(req, res, next)
})

let usersData 
app.get('/connect/:id', (req, res) => {
    const reqEmail = req.params.id
    const newRoomId = uniqid()
    User.findOne({email: reqEmail}, (err, user1Data) => {
        User.findOne({email: req.user.email}, (err, user2Data) => {
            const user1Rooms = user1Data.rooms
            const user2Rooms = user2Data.rooms
            usersData = {originUser: { avatar: user2Data.avatar, name: user2Data.username }, targetUser: { avatar: user1Data.avatar, username: user1Data.username }}
            for (room1 of user1Rooms) {
                for (room2 of user2Rooms) {
                    if (room1 === room2) {
                        return res.send({roomName: room1})
                    }
                }
            }
            user1Rooms.push(newRoomId)
            user2Rooms.push(newRoomId)
            user1Data.save()
            user2Data.save()
            res.send({roomName: newRoomId})
        })
    })
})

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('New user is connected')

    socket.on('join', roomName => {
        socket.join(roomName)
        console.log(roomName)
        // socket.emit('message', {message: 'Weclome! Have a good conversation.'})
        // socket.broadcast.to(roomName).emit('message', { message: 'A new user has joined' })
        socket.on('sendMessage', message => {
            socket.broadcast.to(roomName).emit('message', { message })
        })
    })
})
const PORT = process.env.PORT || 80
server.listen(PORT, () => console.log('Server is running on port 80'))

