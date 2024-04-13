const express = require('express');
const router = express.Router();
const GameBdd = require('../services/GameBDD');

// Find all games
router.get('/', async (req, res) => {
    try {
        const games = await GameBdd.getAllGames();
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Find Game by Id
router.get('/:id', async (req, res) => {
    const gameId = req.params.id;
    try {
        const game = await GameBdd.getGameById(gameId);
        res.json(game);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// Add a Game
router.put('/', async (req, res) => {
    const { users, status } = req.body;
    try {
        const newGame = await GameBdd.createGame(users, status);
        res.status(201).json(newGame);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a Game
router.patch('/:id', async (req, res) => {
    const gameId = req.params.id;
    const { users, status } = req.body;
    try {
        const updatedGame = await GameBdd.updateGame(gameId, users, status);
        res.json(updatedGame);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a game
router.delete('/:id', async (req, res) => {
    const gameId = req.params.id;
    try {
        const result = await GameBdd.deleteGame(gameId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add user to a Game
router.put('/:id/users/add', async (req, res) => {
    const gameId = req.params.id;
    const { userId, score } = req.body;
    try {
        const game = await GameBdd.addUserToGame(gameId, userId, score);
        res.status(201).json(game);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
