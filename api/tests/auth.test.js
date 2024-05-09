const { agent } = require('./setup');
const db = require('../db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ROLES_LIST = JSON.parse(process.env.ROLES_LIST)



describe('Auth', () => {

    let userEmail = 'testAuth2@example.com'
    let testAuthUser
    let roleUser
    beforeAll(async () => {
        // await db.User.destroy({ truncate: true });
        await db.sequelize.sync({ alter: true })


        // Créer un utilisateur pour les tests
        testAuthUser = await db.User.create({
            email: userEmail,
            password: await bcrypt.hash('test', 10),
            pseudo: 'Test User',
            photo: null,
            roles: { "roles": [ROLES_LIST.user] }
        });

        // Recupère ou créer les roles
        [roleUser, created] = await db.Role.findOrCreate({
            where: { name: ROLES_LIST.user }
        });

        // Ajout du role à l'utilisateur
        await testAuthUser.addRole(roleUser);
    });

    afterAll(async () => {
        // Supprimer l'utilisateur créé pour les tests
        await db.User.destroy({ where: { email: userEmail } });

        await db.Role.destroy({ where: { name: ROLES_LIST.user } });

        await db.sequelize.close();
    });

    describe('POST /auth/login', () => {
        it('should return a token', async () => {
            const response = await agent.post('/login').send({
                email: userEmail,
                password: 'test',
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('access_token');

            const decodedToken = jwt.verify(
                response.body.access_token,
                process.env.JWT_SECRET
            );
            expect(decodedToken).toHaveProperty('payload.userId');
            expect(decodedToken).toHaveProperty('payload.userName', 'Test User');
            expect(decodedToken).toHaveProperty('payload.roles');
            expect(decodedToken.payload.roles).toContain(ROLES_LIST.user.toString());
        });

        it('should return a 400 status code for missing credentials', async () => {
            const response = await agent.post('/login').send({});

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('message', 'Bad credentials');
        });

        it('should return a 401 status code for invalid credentials', async () => {
            const response = await agent.post('/login').send({
                email: userEmail,
                password: 'wrong_password',
            });

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('message', 'Wrong credentials');
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent.post('/login').send({
                email: 'nonexistentuser@example.com',
                password: 'test',
            });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', `This user does not exist !`);
        });
    });
});