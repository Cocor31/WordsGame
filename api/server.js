/*************************/
/*** Import used modules */
const app = require('./app')
let DB = require('./db.config')

const SERVER_PORT = process.env.SERVER_PORT || 4000





/*** Démarrage de l'API*/
DB.sequelize.authenticate()
    .then(() => console.log('MariaDB Connexion OK'))
    .then(() => {
        app.listen(SERVER_PORT, () => {
            console.log(`Server listening on ${SERVER_PORT}`);
        });
    })
    .catch(e => console.log('Database Error', e))
