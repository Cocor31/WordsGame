import tokenService from './TokenService';
import socketIO from 'socket.io-client';

//to delete
// const VITE_SERVER_URL = "localhost:5001"
const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "localhost"
const VITE_SOCKET_PORT = import.meta.env.VITE_SOCKET_PORT || "5001"
const SOCKET_URL = 'http://' + VITE_SERVER_URL + ':' + VITE_SOCKET_PORT

const connectSocket = () => {
    const socket = socketIO.connect(SOCKET_URL);
    return socket
};

const addUser = (socket) => {
    // const userId = tokenService.getUserId()
    // const userName = tokenService.getUserName()
    const userInfo = tokenService.getUserPublicData()
    // console.log("userInfo", userInfo)
    socket.emit('newUser', { userId: userInfo.id, userName: userInfo.pseudo, userPhoto: userInfo.photo });
};

const deleteUser = (socket) => {
    const userId = tokenService.getUserId()
    socket.emit('deleteUser', { userId: userId });
};

const sendMessage = (socket, message) => {
    const date = new Date()
    const userName = tokenService.getUserName()
    const userId = tokenService.getUserId()

    if (message.trim() && userId) {
        socket.emit('message', {
            text: message,
            name: userName,
            id: `${userId}_${date.toISOString()}`,
            date: date,
            userId: userId
        });
    }
    console.log({ userName: userName, message });
}

const isTyping = (socket) => {
    const userName = tokenService.getUserName()
    socket.emit('typing', `${userName} is typing`);
};

const resetTyping = (socket) => {
    socket.emit('typing', "");
};


export default {
    connectSocket, addUser, deleteUser, sendMessage, isTyping, resetTyping
};

