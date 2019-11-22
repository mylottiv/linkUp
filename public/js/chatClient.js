$(function() {
        
    // Toggle Materialize input labels
    // M.updateTextFields();

    // Capture clientRoom from header
    const clientRoomName = $('#roomname').text();

    // Initialize socket connection
    const socket = io();
    socket.on('connect', function() {

        console.log('Client socket connected', socket.id);

        // Join client to current chatroom
        socket.emit('join', {user: 'test', clientRoomName});


        // Client-side new message listener
        socket.on('new message', function(newMessage) {

            console.log('New message:', newMessage);
            const {user, content} = newMessage;

            // Reset user typing message if message not from client user
            // if (user !== clientUser) {
                $('#currently-typing').text('');
            // };

            // Add new chat message card to chat box
            $('#chat-box').html($('#chat-box').html() + `<li class='card'><div class='card-content'>${user}: ${content}</div></li>`);
        
        });

        // Client-side listener for other users typing event
        socket.on('typing', function(typingUser) {

            console.log(typingUser, 'is typing');

            // Update currently typing notification
            $('#currently-typing').text(`${typingUser} is currently typing`);

        })
    });

    socket.on('join', function(newUser) {
        console.log('New user:', newUser);

        // Add new chat message card to chat box
        $('#chat-box').html($('#chat-box').html() + `<li class='card'><div class='card-content'>${newUser} has joined the chat!</div></li>`);
    })

    // Handler for new message form submission
    $('#chat-submission').submit(function(e) {

        e.preventDefault();

        // Assemble message data and emit as new message event
        const data = {
            roomName: clientRoomName,
            user: $('#user').val(),
            content: $('#message').val()
        };
        socket.emit('new message', data);

        // Reset message field upon submission
        $('#message').val('');

    });

    // Handler for user typing event
    $('#message').keyup(function(e) {

        e.preventDefault();
        console.log('keyup fired');

        // Emit typing event with user name and room name
        socket.emit('typing', {user: $('#user').val(), roomName: clientRoomName});

    });
});