/*************************/
/*** Import used modules */
// const http = require('./socket')
const { socketRouter } = require('./routes/Socket');
const app = require('./app');
const db = require("./db.config");

/*************************/
/*** Environment Variables */
const SERVER_PORT = process.env.SERVER_PORT || 5001
const FRONT_URL = process.env.FRONT_URL || "localhost"
const FRONT_PORT = process.env.FRONT_PORT || 5173

let SOCKET_URL_LISTEN
if (FRONT_PORT == "80") {
    SOCKET_URL_LISTEN = "http://" + FRONT_URL  //"http://localhost"
} else {
    SOCKET_URL_LISTEN = "http://" + FRONT_URL + ":" + FRONT_PORT //"http://localhost:3000"
}

/*************************/
/*** HTTP Server Creation */
const http = require('http').createServer(app);

/*************************/
/*** Socket Initialization  */
const socketIO = require('socket.io')(http, {
    cors: {
        origin: SOCKET_URL_LISTEN
    }
});

console.log(">>>>>>>> db.url:", db.url)
/*************************/
/*** Start Server without Mongo  */

http.listen(SERVER_PORT, () => {
    console.log(`Server listening on ${SERVER_PORT}`);
});


/*************************/
/*** Start Server with Mongo */
// db.mongoose
//     .connect(db.url)
//     .then(() => {
//         console.log('MongoDB Connexion OK')
//         http.listen(SERVER_PORT, () => {
//             console.log(`Server listening on ${SERVER_PORT}`);
//         });
//     })


/*************************/
/*** Socket Router Connection  */
socketIO.on('connection', (socket) => {
    socketRouter(socket, socketIO);
});
