const { receiveMessage, receiveTyping, receiveNewUser, receiveDeleteUser, receiveDisconnect } = require("../controllers/Socket");


const socketRouter = (socket, socketIO) => {
    console.log(`✅: ${socket.id} user just connected on ! `);

    const eventHandlers = {
        'message': async (data) => {
            receiveMessage(socketIO, data)
        },
        'typing': (data) => {
            receiveTyping(socket, data)
        },
        'newUser': async (data) => {
            receiveNewUser(socket, socketIO, data)
        },
        'deleteUser': async (data) => {
            receiveDeleteUser(socketIO, data)
        },
        'disconnect': async () => {
            receiveDisconnect(socket, socketIO)
        }
    };

    // On attache tous les gestionnaires d'événements
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
        socket.on(eventName, handler);
    }
};

module.exports = { socketRouter };