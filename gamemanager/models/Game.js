
module.exports = mongoose => {
    // Définir le schéma pour l'utilisateur
    const userSchema = new mongoose.Schema({
        id: {
            type: Number,
            required: true
        },
        score: {
            type: Number,
            default: 0
        }
    }, { _id: false });

    // Définir le schéma pour le jeu
    const gameSchema = new mongoose.Schema({
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId,
            required: true
        },
        users: {
            type: [userSchema],
            default: []
        },
        status: {
            type: String,
            enum: ['INPROGRESS', 'FINISHED', 'NOTSTARTED'],
            default: 'NOTSTARTED'
        }
    });

    const Game = mongoose.model('Game_Collection', gameSchema);
    return Game;

}