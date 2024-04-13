const db = require("../db.config");
const Game = db.game;

// Fonction pour récupérer tous les jeux
exports.getAllGames = async () => {
    try {
        const games = await Game.find();
        return games;
    } catch (err) {
        throw new Error(err.message);
    }
};

// Fonction pour récupérer un jeu par son ID
exports.getGameById = async (gameId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        return game;
    } catch (err) {
        throw new Error(err.message);
    }
};

// Fonction pour créer un nouveau jeu
exports.createGame = async (users, status) => {
    const game = new Game({
        users: users,
        status: status
    });

    try {
        const newGame = await game.save();
        return newGame;
    } catch (err) {
        throw new Error(err.message);
    }
};

// Fonction pour mettre à jour un jeu
exports.updateGame = async (gameId, users, status) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        if (users != null) {
            game.users = users;
        }
        if (status != null) {
            game.status = status;
        }

        const updatedGame = await game.save();
        return updatedGame;
    } catch (err) {
        throw new Error(err.message);
    }
};

// Fonction pour supprimer un jeu
exports.deleteGame = async (gameId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        await game.remove();
        return { message: 'Game deleted' };
    } catch (err) {
        throw new Error(err.message);
    }
};

// Fonction pour ajouter un nouvel utilisateur à un jeu
exports.addUserToGame = async (gameId, userId, score) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        const newUser = { id: userId, score: score };
        game.users.push(newUser);
        await game.save();
        return game;
    } catch (err) {
        throw new Error(err.message);
    }
};