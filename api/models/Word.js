/*************************/
/*** Import used modules */
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const Word = sequelize.define('Word', {
        id: {
            type: DataTypes.INTEGER(10),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        value: {
            type: DataTypes.INTEGER,
        },
        isEvaluate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    })
    return Word
}