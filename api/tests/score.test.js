const { agent } = require('./setup');
const db = require('../db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ROLES_LIST = JSON.parse(process.env.ROLES_LIST);
const User = db.User;
const Score = db.Score;

// Fonction pour générer un token valide
function generateToken(userId, roles) {
    const payload = {
        payload: {
            userId: userId,
            userName: 'Test Admin',
            roles: roles
        }
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('Score', () => {
    let testUser;
    let testUserWithoutScore;
    let testScore;
    let adminToken;

    beforeAll(async () => {
        await db.sequelize.sync({ alter: true });

        // Créer un utilisateur pour les tests
        testUser = await User.create({
            pseudo: 'testUser',
            email: 'test@example.com',
            password: await bcrypt.hash('password', 10),
            photo: null,
        });

        // Créer un utilisateur pour les tests
        testUserWithoutScore = await User.create({
            pseudo: 'testUserWithoutScore',
            email: 'test_without_score@example.com',
            password: await bcrypt.hash('password', 10),
            photo: null,
        });

        // Créer un score initial pour l'utilisateur
        testScore = await Score.create({ UserId: testUser.id });

        // Générer un token admin
        adminToken = generateToken(testUser.id, [ROLES_LIST.admin]);
    });

    afterAll(async () => {
        // Supprimer l'utilisateur et le score créés pour les tests
        await testUser.destroy();
        await testScore.destroy();

        await db.sequelize.close();
    });

    describe('PATCH /scores/:user_id', () => {
        it('should update the score for an existing user', async () => {
            const response = await agent
                .patch(`/scores/${testUser.id}`)
                .send({
                    score: 50,
                    win: true,
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Score updated successfully');
            expect(response.body.data).toHaveProperty('score', testScore.score + 50);
            expect(response.body.data).toHaveProperty('totalGamesPlayed', testScore.totalGamesPlayed + 1);
            expect(response.body.data).toHaveProperty('totalGamesWon', testScore.totalGamesWon + 1);
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent
                .patch('/scores/9999999999')
                .send({
                    score: 50,
                    win: true,
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'User not found');
        });

        it("should return a 404 status code for a non-existent user'score", async () => {
            const response = await agent
                .patch(`/scores/${testUserWithoutScore.id}`)
                .send({
                    score: 50,
                    win: true,
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'Score not found for this user');
        });

        it('should return a 400 status code for invalid data', async () => {
            const response = await agent
                .patch(`/scores/${testUser.id}`)
                .send({
                    score: 'not_a_number', // Score invalide
                    win: 'invalid_boolean', // Valeur booléenne invalide
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid data format');
        });

    });
});