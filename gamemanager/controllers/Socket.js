const GameService = require("../services/GameService");

let users = [];

const receiveMessage = async (socketIO, data) => {
    console.log("message :", data)
    socketIO.emit('messageResponse', data);
    const hitWord = await GameService.getWordHit(data.text)
    const UserIdSender = data.userId
    users = await GameService.hitOpponentsUsers(users, UserIdSender, hitWord)
    socketIO.emit('updateUsersScores', users);
}

const receiveTyping = async (socket, data) => {
    socket.broadcast.emit('typingResponse', data);
}

const receiveNewUser = async (socket, socketIO, data) => {
    users = await GameService.addUserToGroup(users, data, socket.id);
    socketIO.emit('newUserResponse', users);
}

const receiveDeleteUser = async (socketIO, data) => {
    users = await GameService.deleteUserFromGroup(users, data.userId);
    socketIO.emit('newUserResponse', users);
}

const receiveDisconnect = async (socket, socketIO) => {
    console.log('❌: A user disconnected');
    const socketIdUser = socket.id;
    users = await GameService.deleteUserFromGroupWithsocket(users, socketIdUser);
    socketIO.emit('newUserResponse', users);
}

module.exports = {
    receiveMessage,
    receiveTyping,
    receiveNewUser,
    receiveDeleteUser,
    receiveDisconnect
};