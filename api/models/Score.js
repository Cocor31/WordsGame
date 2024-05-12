const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Score = sequelize.define('Score', {
        UserId: {
            type: DataTypes.INTEGER(10),
            primaryKey: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        totalGamesPlayed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        totalGamesWon: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    });
    return Score;
};
