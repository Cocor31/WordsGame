const { agent } = require('./setup');
const db = require('../db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ROLES_LIST = JSON.parse(process.env.ROLES_LIST);
const Role = db.Role;

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

describe('Role', () => {
    let testRole;
    let userEmail = 'user.role.test@example.com'
    let userToken;
    let adminToken;

    beforeAll(async () => {
        await db.sequelize.sync({ alter: true });

        // Créer un rôle pour les tests
        testRole = await Role.create({
            name: 'test',
        });

        // Créer un utilisateur admin pour les tests
        const user = await db.User.create({
            email: userEmail,
            password: await bcrypt.hash('pass', 10),
            pseudo: 'Test User',
            photo: null,
        });

        // Générer un token admin
        userToken = generateToken(user.id, [ROLES_LIST.user]);
        adminToken = generateToken(user.id, [ROLES_LIST.admin]);
    });

    afterAll(async () => {
        // Supprimer le rôle créé pour les tests
        await Role.destroy({ where: { id: testRole.id } });

        // Supprimer l'utilisateur créé pour les tests
        await db.User.destroy({ where: { email: userEmail } });

        await db.sequelize.close();
    });

    describe('GET /roles', () => {
        it('should return an array of roles for admin', async () => {
            const response = await agent
                .get('/roles')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('name');
        });

        it('should return a 403 status code for non-admin', async () => {
            const response = await agent
                .get('/roles')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });
    });

    describe('GET /roles/:id', () => {
        it('should return a role for admin', async () => {
            const response = await agent
                .get(`/roles/${testRole.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveProperty('id', testRole.id);
            expect(response.body.data).toHaveProperty('name', 'test');
        });

        it('should return a 403 status code for non-admin', async () => {
            const response = await agent
                .get(`/roles/${testRole.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return a 404 status code for a non-existent role', async () => {
            const response = await agent
                .get('/roles/9999999999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This role does not exist !');
        });
    });

    describe('POST /roles', () => {
        it('should create a new role for admin', async () => {
            const response = await agent
                .post('/roles')
                .send({
                    name: 'new',
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('message', 'Role Created');
            expect(response.body).toHaveProperty('data.id');
            expect(response.body).toHaveProperty('data.name', 'new');

            // Supprimer le rôle créé pour le test
            await Role.destroy({ where: { id: response.body.data.id } });
        });

        it('should return a 400 status code when missing data', async () => {
            const response = await agent
                .post('/roles')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(400);
        });

        it('should return a 403 status code for non-admin', async () => {
            const response = await agent
                .post('/roles')
                .send({
                    name: 'new',
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return a 409 status code for an existing name', async () => {
            const response = await agent
                .post('/roles')
                .send({
                    name: 'test',
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(409);
            expect(response.body).toHaveProperty('message', `This role is already associated with a user !`);
        });
    });

    describe('PATCH /roles/:id', () => {
        it('should update a role for admin', async () => {
            const response = await agent
                .patch(`/roles/${testRole.id}`)
                .send({
                    name: 'updated',
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Role Updated');
            expect(response.body).toHaveProperty('data.id', testRole.id);
            expect(response.body).toHaveProperty('data.name', 'updated');

            // Mettre à jour le rôle pour les tests suivants
            testRole.name = 'updated';
        });

        it('should return a 403 status code for non-admin', async () => {
            const response = await agent
                .patch(`/roles/${testRole.id}`)
                .send({
                    name: 'updated',
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return a 404 status code for a non-existent role', async () => {
            const response = await agent
                .patch('/roles/9999999999')
                .send({
                    name: 'updated',
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This role does not exist !');
        });
    });

    describe('DELETE /roles/:id', () => {
        it('should delete a role for admin', async () => {
            const response = await agent
                .delete(`/roles/${testRole.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', `Role (id: ${testRole.id} ) Successfully Deleted. 1 row(s) deleted`);

            // Vérifier que le rôle a bien été supprimé de la base de données
            const deletedRole = await Role.findOne({ where: { id: testRole.id } });
            expect(deletedRole).toBeNull();
        });

        it('should return a 403 status code for non-admin', async () => {
            const response = await agent
                .delete(`/roles/${testRole.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return a 404 status code for a non-existent role', async () => {
            const response = await agent
                .delete('/roles/9999999999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This role does not exist !');
        });
    });
});