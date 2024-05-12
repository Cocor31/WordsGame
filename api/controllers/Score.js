/***********************************/
/*** Import des module nécessaires */
const DB = require('../db.config')
const User = DB.User
const Score = DB.Score

/**********************************/
/*** Routage de la ressource Score */

exports.updateScore = async (req, res) => {
    let userId
    let score
    let win

    // Validation des données reçues
    try {

        userId = parseInt(req.params.user_id);

        score = parseInt(req.body.score);

        win = JSON.parse(req.body.win);

    } catch (error) {
        // console.error(error);
        return res.status(400).json({ message: 'Invalid data format' });
    }

    try {
        // Récupérer l'utilisateur à partir de son ID
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Récupérer le score existant de l'utilisateur
        const existingScore = await Score.findOne({ where: { UserId: userId } });

        if (!existingScore) {
            return res.status(404).json({ message: 'Score not found for this user' });
        }

        // Mettre à jour les propriétés du score
        existingScore.score += score;
        existingScore.totalGamesPlayed++;
        if (win) {
            existingScore.totalGamesWon++;
        }

        // Enregistrer les modifications
        await existingScore.save();

        return res.status(200).json({ message: 'Score updated successfully', data: existingScore });
    } catch (error) {
        // console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};