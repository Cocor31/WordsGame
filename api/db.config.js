/*************************/
/*** Import used modules */
const { Sequelize } = require('sequelize')

/*************************/
/*** Récupération variables de connexion */
const MARIADB_DATABASE = process.env.MARIADB_DATABASE
const MARIADB_USER = process.env.MARIADB_USER
const MARIADB_PASSWORD = process.env.MARIADB_PASSWORD
const MARIADB_HOST = process.env.MARIADB_HOST
const MARIADB_PORT = process.env.MARIADB_PORT

/*************************/
/*** Connexion à la base de donnée */
let sequelize = new Sequelize(
    MARIADB_DATABASE,
    MARIADB_USER,
    MARIADB_PASSWORD,
    {
        host: MARIADB_HOST,
        port: MARIADB_PORT,
        dialect: 'mysql',
        logging: false
    }
)

/*************************/
/*** Appel des modèles */
const db = {}
db.sequelize = sequelize
db.User = require('./models/User')(sequelize)
db.Role = require('./models/Role')(sequelize)
db.Word = require('./models/Word')(sequelize)
db.Score = require('./models/Score')(sequelize)


/*************************/
/*** Mise en place des relations */
db.User.belongsToMany(db.Role, { through: 'User_Role' })
db.Role.belongsToMany(db.User, { through: 'User_Role' })
db.User.hasOne(db.Score, {
    onDelete: 'CASCADE',
    foreignKey: {
        allowNull: false,
        unique: true
    }
});

/*************************/
/*** Synchronisation des modèles */
db.sequelize.sync({ alter: true })     // permet de synchroniser les models JS avec les tables dans la BDD

module.exports = db

