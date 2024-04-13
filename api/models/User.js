/*************************/
/*** Import used modules */
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER(10),
            primaryKey: true,
            autoIncrement: true
        },
        // firstname: {
        //     type: DataTypes.STRING(100),
        //     defaultValue: '',
        //     allowNull: false
        // },
        // lastname: {
        //     type: DataTypes.STRING(100),
        //     defaultValue: '',
        //     allowNull: false
        // },
        pseudo: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,             // Ici une contrainte de données
            },
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(64),
            is: /^[0-9a-f]{64}$/i,        // Ici une contrainte de données
            allowNull: false
        },
        roles: {
            type: DataTypes.JSON(),
            allowNull: false
        },
        photo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    })
    return User
}