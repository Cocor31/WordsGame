/*************************/
/*** Import used modules */
const mongoose = require("mongoose");

/*************************/
/*** Récupération variables de connexion */
const MONGODB_USER = process.env.MONGODB_USER
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD
const MONGODB_DATABASE = process.env.MONGODB_DATABASE
const MONGODB_DOCKER_PORT = process.env.MONGODB_DOCKER_PORT
const MONGODB_HOST = process.env.MONGODB_HOST

/*************************/
/*** Connexion à la base de donnée */


/*************************/
/*** Appel des modèles */
const db = {}
db.mongoose = mongoose;
db.game = require("./models/Game.js")(mongoose);
// db.url = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_DOCKER_PORT}/${MONGODB_DATABASE}?authSource=admin`
// db.url = "mongodb://admin:nimda@mongo_db:27017/mongo_game_db?authSource=admin"
// db.url = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?authSource=admin`
db.url = process.env.MONGO_DB_STRING

/*************************/
/*** Mise en place des relations */


// /*************************/
// /*** Synchronisation des modèles */


module.exports = db

