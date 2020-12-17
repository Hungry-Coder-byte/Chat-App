const express = require("express");
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const socketsArray = [];
const route = require('./routes/chats.js');

app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

var server = app.listen(5001, function (err) {
    if (err) throw err;

    var message = 'Server is running @ http://localhost:' + server.address().port;
    console.log(message);
});

const io = require('socket.io')(server);

app.get('/', (req, res) => {
    console.log("sending file");
    // res.sendFile(__dirname + '/chat1.html');
})

app.post('/validate_user', (req, res) => {
    console.log("Request body", req.body);
    route.validateUser(req.body.phone, res);
});

app.get('/verify_otp/:phone/:otp', route.verifyOtp);
app.post('/create_user', route.create_new_user);

app.get('/user_chats/:user_id', route.getChats);
app.get('/chat_conversations/:user_id', route.getConversations);

io.on('connection', (socket) => {
    io.to(socket.id).emit('socket-connected', { id: socket.id });
    socket.on("connected", async (user) => {
        console.log("Connected", user);
        await route.updateUserSocketId(user);
        route.setOnlineStatus(user.id, "Online", io);
    });
    socket.on('get-conversation', (user) => {
        console.log("Conversation requested for user", user);
        route.getConversations(user, socket, io);
    });
    socket.on('send-message', (user) => {
        console.log("Message to send", user);
        route.sendMessage(user, io);
    })
    socket.on('create-room', (user_details) => {
        console.log("New room to be creaed", user_details);
        route.createVideoRoom(user_details, io, socket);
    });

    socket.on('join-room', (room) => {
        console.log("Room to connect", room.room_name);
    });

    socket.on('connect-room', (room) => {
        socket.join(room.room.room_name);
        console.log("user joined room", room.room);
    })

    socket.on('make-offer', function (data) {
        console.log("Make offer", data);
        socket.to(data.to).emit('offer-made', {
            offer: data.offer,
            socket: socket.id
        });
    });
    socket.on('make-answer', function (data) {
        console.log("Make answer", data);
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        });
    });
    socket.on('get-contacts', (user_id) => {
        console.log("Inside get-contacts", user_id);
        route.getUserContacts(user_id, io);
    });
    socket.on('create-contact', (contact) => {
        console.log("Inside create-contact", contact);
        route.createContact(contact, io);
    });
    socket.on('delete-chat', (chat) => {
        console.log("Inside delete-contact", chat);
        route.deleteChat(chat, io);
    });
    socket.on('create-meet', (user) => {
        route.createMeet(user, io);
    });
    socket.on('typing', (data) => {
        route.sendTypingStatus(data, io);
    });
    socket.on('update-profile-pic', (data) => {
        route.updateProfilePic(data, io);
    });
    socket.on('send-attachment', (data) => {
        console.log("Attachment to send", data.sender, data.id, data.message.length, data.receiver);
        route.sendMessage(data, io);
    });
    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id);
        route.setOnlineStatus(socket.id, "Offline", io);
        socketsArray.splice(socketsArray.indexOf(socket.id), 1);
        // socket.to("room").emit('remove-user', socket.id);
    });
});