const app = require('express')();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT);
const path = require('path');
const io = require('socket.io').listen(server);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'chat.html'));
})

io.on('connection', function(socket) {
    console.log('Socket connected:');

    socket.on('message', function(newMessage) {
        console.log('New Socket Message', newMessage);
        io.emit('message', newMessage);
    });

    socket.on('typing', function(typingUser) {
        console.log(typingUser, 'is currently typing')
        io.emit('typing', typingUser);
    })

    socket.on('disconnect', function() {
        console.log('Socket disconnected');
    })
});
