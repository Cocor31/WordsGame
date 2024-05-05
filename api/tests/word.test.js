const { agent } = require('./setup');
const db = require('../db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ROLES_LIST = JSON.parse(process.env.ROLES_LIST)

// Fonction pour générer un token valide
function generateToken(userId, roles) {
    const payload = {
        payload: {
            userId: userId,
            userName: 'Test User',
            roles: roles
        }

    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('Word', () => {

    let adminToken
    let modoToken
    let userToken

    beforeAll(async () => {
        await db.sequelize.sync({ alter: true })

        // Créer un mot pour les tests
        await db.Word.create({
            name: 'test',
            value: 3,
            isEvaluate: true,
        });
        await db.Word.create({
            name: 'testHit',
            value: 12,
            isEvaluate: true,
        });

        // Créer un utilisateur pour les tests
        const testUser = await db.User.create({
            email: 'testword@example.com',
            password: await bcrypt.hash('test', 10),
            pseudo: 'Test Word User',
            photo: null,
            roles: { "roles": [ROLES_LIST.user] },
        });

        // Générer un token admin
        adminToken = generateToken(testUser.id, [ROLES_LIST.admin]);
        // Générer un token modérateur
        modoToken = generateToken(testUser.id, [ROLES_LIST.modo]);
        // Générer un token user
        userToken = generateToken(testUser.id, [ROLES_LIST.user]);


    });

    afterAll(async () => {
        // Supprimer les mots et utilisateurs créés pour les tests
        await db.Word.destroy({ where: { name: 'test' } });
        await db.Word.destroy({ where: { name: 'new' } });
        await db.Word.destroy({ where: { name: 'updated' } });
        await db.Word.destroy({ where: { name: 'testHit' } });
        await db.Word.destroy({ where: { name: 'newword' } });
        await db.User.destroy({ where: { email: 'testword@example.com' } });

        await db.sequelize.close();
    });

    describe('GET /words', () => {
        it('should return an array of words', async () => {

            const response = await agent
                .get('/words')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('name');
            expect(response.body.data[0]).toHaveProperty('value');
            expect(response.body.data[0]).toHaveProperty('isEvaluate');
        });
    });

    describe('GET /words/:id', () => {
        it('should return a word', async () => {
            const word = await db.Word.findOne({ where: { name: 'test' } });

            const response = await agent
                .get(`/words/${word.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveProperty('id', word.id);
            expect(response.body.data).toHaveProperty('name', 'test');
            expect(response.body.data).toHaveProperty('value', 3);
            expect(response.body.data).toHaveProperty('isEvaluate', true);
        });

        it('should return a 404 status code for a non-existent word', async () => {
            const response = await agent
                .get('/words/9999999999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This word does not exist !');
        });
    });

    describe('PUT /words', () => {
        it('should create a new word', async () => {
            const response = await agent
                .put('/words')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'new',
                    value: 2,
                    isEvaluate: true,
                })
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Word Created');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name', 'new');
            expect(response.body.data).toHaveProperty('value', 2);
            expect(response.body.data).toHaveProperty('isEvaluate', true);
        });

        it('should return a 400 status code and a missing data message when the name property is missing', async () => {
            const response = await agent
                .put('/words')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    value: 5,
                    isEvaluate: true,
                })
                .expect(400);

            expect(response.body).toHaveProperty('message', `Missing Data`);
        });

        it('should return a 409 status code for an existing word', async () => {
            const response = await agent
                .put('/words')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'test',
                    value: 2,
                    isEvaluate: true,
                })
                .expect(409);

            expect(response.body).toHaveProperty('message', `This word already exists !`);
        });
    });

    describe('PATCH /words/:id', () => {
        it('should update a word', async () => {
            const word = await db.Word.findOne({ where: { name: 'test' } });

            const response = await agent
                .patch(`/words/${word.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'updated',
                    value: 4,
                })
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Word Updated');
            expect(response.body.data).toHaveProperty('id', word.id);
            expect(response.body.data).toHaveProperty('name', 'updated');
            expect(response.body.data).toHaveProperty('value', 4);
            expect(response.body.data).toHaveProperty('isEvaluate', true);
        });

        it('should return a 404 status code for a non-existent word', async () => {
            const response = await agent
                .patch('/words/9999999999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'updated',
                    value: 5,
                    isEvaluate: false,
                });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This word does not exist !');
        });
    });

    describe('DELETE /words/:id', () => {
        it('should delete a word', async () => {
            const word = await db.Word.findOne({ where: { name: 'updated' } });

            const response = await agent
                .delete(`/words/${word.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', `Word (id: ${word.id} ) Successfully Deleted. 1 row(s) deleted`);

            // Vérifier que le mot a bien été supprimé de la base de données
            const deletedWord = await db.Word.findOne({ where: { name: 'updated' } });
            expect(deletedWord).toBeNull();
        });

        it('should return a 404 status code for a non-existent word', async () => {
            const response = await agent
                .delete('/words/9999999999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('message', `This word does not exist !`);
        });
    });

    describe('POST /words/hit', () => {
        it('should return the value of a word', async () => {
            const response = await agent
                .post('/words/hit')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'testHit' });

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toBe(12);
        });

        it('should create a new word when the word does not exist in the database', async () => {
            const newWordName = 'newword';

            // Vérifier qu'il n'existe pas de mot avec le même nom dans la base de données
            const existingWord = await db.Word.findOne({ where: { name: newWordName } });
            expect(existingWord).toBeNull();

            // Envoyer une requête POST pour récupérer la valeur du mot
            const response = await agent
                .post('/words/hit')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: newWordName });

            // Vérifier que la réponse contient le message "Word Not Found" et le code d'état 400
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toEqual('Word Not Found');

            // Vérifier que le mot a été créé dans la base de données
            const createdWord = await db.Word.findOne({ where: { name: newWordName } });
            expect(createdWord).not.toBeNull();
            expect(createdWord.name).toEqual(newWordName);
            expect(createdWord.value).toBeNull();
            expect(createdWord.isEvaluate).toBeFalsy();
        });

        it('should return a 400 status code for missing data', async () => {
            const response = await agent
                .post('/words/hit')
                .set('Authorization', `Bearer ${userToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Missing Data');
        });

        it('should return a 403 status code for words with more than one word', async () => {
            const response = await agent
                .post('/words/hit')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'test word' });

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe('Word should contain only one word');
        });

        it('should return a 400 status code for a word not found', async () => {
            const response = await agent
                .post('/words/hit')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'unknown' });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Word Not Found');
        });
    });
});
