const GameService = require("../services/GameService");

let users = [];
let messages = [];


const receiveMessage = async (socketIO, data) => {
    console.log("===============================================")
    console.log("message :", data)
    messages = [...messages, data]
    socketIO.emit('messageResponse', messages);
    const hitWord = await GameService.getWordHit(data.text)
    const UserIdSender = data.userId
    users = await GameService.hitOpponentsUsers(users, UserIdSender, hitWord)
    socketIO.emit('updateUsersScores', users);

    // Vérifier si la partie est terminée
    const { isGameFinished, winner } = GameService.checkIfGameFinished(users);
    if (isGameFinished) {
        console.log(">>> Partie Terminée <<<")
        socketIO.emit('gameFinished', winner);
        GameService.saveGameResult(users, winner)
        // On efface les joueurs de la partie
        users = []
        messages = []
    }
}

const receiveTyping = async (socket, data) => {
    socket.broadcast.emit('typingResponse', data);
}

const receiveNewUser = async (socket, socketIO, data) => {
    users = await GameService.addUserToGroup(users, data, socket.id);
    socketIO.emit('newUserResponse', users);
    socketIO.emit('messageResponse', messages);
}

const receiveDeleteUser = async (socketIO, data) => {
    users = await GameService.deleteUserFromGroup(users, data.userId);
    if (users.length === 0) { messages = [] }
    socketIO.emit('newUserResponse', users);
}

const receiveDisconnect = async (socket, socketIO) => {
    console.log('❌: A user disconnected');
    const socketIdUser = socket.id;
    users = await GameService.deleteUserFromGroupWithsocket(users, socketIdUser);
    if (users.length === 0) { messages = [] }
    socketIO.emit('newUserResponse', users);
}

module.exports = {
    receiveMessage,
    receiveTyping,
    receiveNewUser,
    receiveDeleteUser,
    receiveDisconnect
};