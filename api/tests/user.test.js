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

// Fonction pour générer un token non-valide
function generateWrongToken(userId, roles) {
    const payload = {
        payload: {
            userId: userId,
            userName: 'Test User',
            roles: roles
        }

    };
    return jwt.sign(payload, "un faux secret", { expiresIn: '1h' });
}

// Fonction pour générer un token non-valide
function generateTokenWithoutRoles(userId, roles) {
    const payload = {
        payload: {
            userId: userId,
            userName: 'Test User',
        }

    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('User', () => {
    // Utilisateur pour les tests
    let userEmail = 'test@example.com'
    let userEmailRole = 'test.role@example.com'

    let testUser;
    let testUserRole;

    let roleUser;
    let roleModo
    let roleAdmin

    let adminToken;
    let modoToken;
    let userToken;
    let wrongToken;
    let withoutRolesToken;



    beforeAll(async () => {
        await db.sequelize.sync({ alter: true })

        // Créer un utilisateur pour les tests
        testUser = await db.User.create({
            email: userEmail,
            password: await bcrypt.hash('test', 10),
            pseudo: 'Test User',
            photo: null,
            roles: { "roles": [ROLES_LIST.user] },
        });

        // Créer un utilisateur pour les tests
        testUserRole = await db.User.create({
            email: userEmailRole,
            password: await bcrypt.hash('test', 10),
            pseudo: 'Test User Role',
            photo: null,
            roles: { "roles": [ROLES_LIST.user] },
        });

        // Recupère ou créer les roles
        [roleUser, created] = await db.Role.findOrCreate({
            where: { name: ROLES_LIST.user }
        });
        [roleModo, created2] = await db.Role.findOrCreate({
            where: { name: ROLES_LIST.modo }
        });
        [roleAdmin, created3] = await db.Role.findOrCreate({
            where: { name: ROLES_LIST.admin }
        });

        // Ajout du role à l'utilisateur
        await testUserRole.addRole(roleUser);

        // Générer un token admin
        adminToken = generateToken(testUser.id, [ROLES_LIST.admin]);
        // Générer un token modérateur
        modoToken = generateToken(testUser.id, [ROLES_LIST.modo]);
        // Générer un token user
        userToken = generateToken(testUser.id, [ROLES_LIST.user]);
        // Générer un mauvais token
        wrongToken = generateWrongToken(testUser.id, [ROLES_LIST.user]);
        // Générer un token valide mais sans roles
        withoutRolesToken = generateTokenWithoutRoles(testUser.id, [ROLES_LIST.user]);
    });

    afterAll(async () => {
        // Supprimer les utilisateurs créés pour les tests
        await db.User.destroy({ where: { id: testUser.id } });
        await db.User.destroy({ where: { id: testUserRole.id } });

        // Supprimer les roles créés pour les tests
        await db.Role.destroy({ where: { id: roleUser.id } });
        await db.Role.destroy({ where: { id: roleModo.id } });
        await db.Role.destroy({ where: { id: roleAdmin.id } });

        await db.sequelize.close();
    });

    describe('GET /users', () => {
        it('should return an array of users', async () => {
            const response = await agent.get('/users');

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('email');
            expect(response.body.data[0]).toHaveProperty('pseudo');
            expect(response.body.data[0]).toHaveProperty('photo', null);

        });
    });

    describe('GET /users/:id', () => {
        it('should return a user for admin', async () => {
            const user = await db.User.findOne({ where: { email: userEmail } });

            const response = await agent
                .get(`/users/${user.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveProperty('id', user.id);
            expect(response.body.data).toHaveProperty('email', userEmail);
            expect(response.body.data).toHaveProperty('pseudo', 'Test User');
            expect(response.body.data).toHaveProperty('photo', null);

        });

        it('should return a user for modo', async () => {
            const user = await db.User.findOne({ where: { email: userEmail } });

            const response = await agent
                .get(`/users/${user.id}`)
                .set('Authorization', `Bearer ${modoToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveProperty('id', user.id);
            expect(response.body.data).toHaveProperty('email', userEmail);
            expect(response.body.data).toHaveProperty('pseudo', 'Test User');
            expect(response.body.data).toHaveProperty('photo', null);

        });

        it('should return a user for self', async () => {
            const user = await db.User.findOne({ where: { email: userEmail } });

            const response = await agent
                .get(`/users/${testUser.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveProperty('id', user.id);
            expect(response.body.data).toHaveProperty('email', userEmail);
            expect(response.body.data).toHaveProperty('pseudo', 'Test User');
            expect(response.body.data).toHaveProperty('photo', null);

        });

        it('should return a 403 status code for non-admin and non-self user', async () => {
            // Créer un autre utilisateur pour le test
            const anotherUser = await db.User.create({
                email: 'another@example.com',
                password: await bcrypt.hash('another', 10),
                pseudo: 'Another User',
                photo: null,
                roles: { "roles": [ROLES_LIST.user] },
            });
            const anotherUserToken = generateToken(anotherUser.id, [ROLES_LIST.user]);

            const response = await agent
                .get(`/users/${testUser.id}`)
                .set('Authorization', `Bearer ${anotherUserToken}`);

            expect(response.statusCode).toBe(403);

            // Supprimer l'utilisateur créé pour le test
            await anotherUser.destroy();
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent
                .get('/users/9999999999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This user does not exist !');
        });

        // it('should return a 500 status code for a database error', async () => {
        //     // Simuler une erreur de base de données en remplaçant la méthode findOne de User
        //     const originalFindOne = db.User.findOne;
        //     db.User.findOne = async () => {
        //         throw new Error('Database error');
        //     };

        //     const response = await agent
        //         .get(`/users/${testUser.id}`)
        //         .set('Authorization', `Bearer ${adminToken}`);

        //     expect(response.statusCode).toBe(500);
        //     expect(response.body).toHaveProperty('message', 'Database Error');
        //     expect(response.body).toHaveProperty('error');

        //     // Rétablir la méthode findOne d'origine
        //     db.User.findOne = originalFindOne;
        // });
    });

    describe('GET /users/me', () => {
        it('should return the public data of the logged in user', async () => {
            const response = await agent
                .get('/users/me')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveProperty('id', testUser.id);
            expect(response.body.data).toHaveProperty('email', userEmail);
            expect(response.body.data).toHaveProperty('pseudo', 'Test User');
            expect(response.body.data).toHaveProperty('photo', null);
        });

        it('should return a 401 status code for unauthenticated requests', async () => {
            const response = await agent.get('/users/me');

            expect(response.statusCode).toBe(401);

        });
    });

    describe('PUT /users', () => {
        it('should create a new user for admin', async () => {
            userEmailNew = 'new2@example.com'
            const response = await agent
                .put('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    email: userEmailNew,
                    password: 'new',
                    pseudo: 'New User',
                    photo: null,
                    roles: { "roles": [ROLES_LIST.user] },
                })
                .expect(201);

            expect(response.body).toHaveProperty('message', 'User Created');
            expect(response.body).toHaveProperty('data.id');
            expect(response.body).toHaveProperty('data.email', userEmailNew);
            expect(response.body).toHaveProperty('data.pseudo', 'New User');
            expect(response.body).toHaveProperty('data.photo', null);

            // Vérifier que le mot de passe est bien haché dans la base de données
            const user = await db.User.findOne({ where: { email: userEmailNew } });
            expect(await bcrypt.compare('new', user.password)).toBe(true);

            // Supprimer l'utilisateur créé pour le test
            await user.destroy();
        });

        it('should return a 400 status code when missing data', async () => {
            const response = await agent
                .put('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    pseudo: 'New User',
                })

            expect(response.statusCode).toBe(400);
        });

        it('should return a 401 status code for wrong token', async () => {
            const response = await agent
                .put('/users')
                .set('Authorization', `Bearer ${wrongToken}`)
                .send({
                    email: 'new2@example.com',
                    password: 'new',
                    pseudo: 'New User',
                    photo: null,
                });
            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('message', `Bad token`);
        });

        it('should return a 403 status code for token without roles', async () => {
            const response = await agent
                .put('/users')
                .set('Authorization', `Bearer ${withoutRolesToken}`)
                .send({
                    email: 'new2@example.com',
                    password: 'new',
                    pseudo: 'New User',
                    photo: null,
                });
            expect(response.statusCode).toBe(403);
        });

        it('should return a 403 status code for non-admin user', async () => {
            const response = await agent
                .put('/users')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    email: 'new2@example.com',
                    password: 'new',
                    pseudo: 'New User',
                    photo: null,
                });
            expect(response.statusCode).toBe(403);
        });

        it('should return a 409 status code for an existing email', async () => {
            const response = await agent
                .put('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    email: userEmail,
                    password: 'new',
                    pseudo: 'New User',
                    photo: null,

                })
            expect(response.statusCode).toBe(409);
            expect(response.body).toHaveProperty('message', `This email is already associated with a user !`);
        });
    });

    describe('PATCH /users/:id', () => {
        it('should update a user for admin', async () => {
            const user = await db.User.findOne({ where: { email: userEmail } });

            const response = await agent
                .patch(`/users/${user.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    email: 'updated@example.com',
                    password: 'updated',
                    pseudo: 'Updated User',
                    photo: null,
                })
                .expect(200);

            expect(response.body).toHaveProperty('message', 'User Updated');
            expect(response.body).toHaveProperty('data.id', user.id);
            expect(response.body).toHaveProperty('data.email', 'updated@example.com');
            expect(response.body).toHaveProperty('data.pseudo', 'Updated User');
            expect(response.body).toHaveProperty('data.photo', null);

            // Vérifier que le mot de passe est bien haché dans la base de données
            const updatedUser = await db.User.findOne({ where: { email: 'updated@example.com' } });
            expect(await bcrypt.compare('updated', updatedUser.password)).toBe(true);
        });

        it('should update a user for self', async () => {
            const response = await agent
                .patch(`/users/${testUser.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    email: userEmail,
                    password: 'updated',
                    pseudo: 'Updated User',
                    photo: null,
                })
                .expect(200);

            expect(response.body).toHaveProperty('message', 'User Updated');
            expect(response.body).toHaveProperty('data.id', testUser.id);
            expect(response.body).toHaveProperty('data.email', userEmail);
            expect(response.body).toHaveProperty('data.pseudo', 'Updated User');
            expect(response.body).toHaveProperty('data.photo', null);
        });

        it('should return a 403 status code for non-admin and non-self user', async () => {
            // Créer un autre utilisateur pour le test
            const anotherUser = await db.User.create({
                email: 'another@example.com',
                password: await bcrypt.hash('another', 10),
                pseudo: 'Another User',
                photo: null,
                roles: { "roles": [ROLES_LIST.user] },
            });
            const anotherUserToken = generateToken(anotherUser.id, [ROLES_LIST.user]);


            const user = await db.User.findOne({ where: { email: userEmail } });
            const response = await agent
                .patch(`/users/${user.id}`)
                .set('Authorization', `Bearer ${anotherUserToken}`)
                .send({
                    email: userEmail,
                    password: 'updated',
                    pseudo: 'Updated User',
                    photo: null,
                });

            expect(response.statusCode).toBe(403);

            // Supprimer l'utilisateur créé pour le test
            await anotherUser.destroy();
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent
                .patch('/users/9999999999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    email: 'updated@example.com',
                    password: 'updated',
                    pseudo: 'Updated User',
                    photo: null,
                    roles: ['user', 'admin'],
                });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This user does not exist !');
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user for admin', async () => {
            const user = await db.User.findOne({ where: { email: userEmail } });

            const response = await agent
                .delete(`/users/${user.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', `User (id: ${user.id} ) Successfully Deleted. 1 row(s) deleted`);

            // Vérifier que l'utilisateur a bien été supprimé de la base de données
            const deletedUser = await db.User.findOne({ where: { email: userEmail } });
            expect(deletedUser).toBeNull();
        });

        it('should return a 403 status code for non-admin user', async () => {

            // Créer un utilisateur pour le test
            const testUserToDelete = await db.User.create({
                email: userEmail,
                password: await bcrypt.hash('test', 10),
                pseudo: 'Test User',
                photo: null,
                roles: { "roles": [ROLES_LIST.user] },
            });

            const response = await agent
                .delete(`/users/${testUserToDelete.id}`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(response.statusCode).toBe(403);

            // Supprimer l'utilisateur créé pour le test
            await testUserToDelete.destroy();
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent
                .delete('/users/9999999999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('message', `This user does not exist !`);
        });
    });

    describe('GET /users/:id/roles', () => {
        it('should return the roles of a user for admin', async () => {
            const user = await db.User.findOne({ where: { email: userEmailRole } });

            const response = await agent
                .get(`/users/${user.id}/roles`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveProperty('UserId', user.id);
            expect(response.body.data).toHaveProperty('roles');
            expect(response.body.data.roles).toEqual([ROLES_LIST.user.toString()]);
        });

        it('should return a 403 status code for non-admin user', async () => {
            const user = await db.User.findOne({ where: { email: userEmailRole } });

            const response = await agent
                .get(`/users/${user.id}/roles`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent
                .get('/users/9999999999/roles')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This user does not exist !');
        });
    });

    describe('POST /users/:id/roles/:role', () => {
        it('should add a role to a user for admin', async () => {
            const user = await db.User.findOne({ where: { email: userEmailRole } });

            const response = await agent
                .post(`/users/${user.id}/roles/${roleModo.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'User role Updated');
            expect(response.body).toHaveProperty('data.role');
            expect(response.body.data.role).toEqual(ROLES_LIST.modo.toString());
        });

        it('should return a 400 status code for role already allocated to the user', async () => {
            const user = await db.User.findOne({ where: { email: userEmailRole } });

            const response = await agent
                .post(`/users/${user.id}/roles/${roleUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('message', 'This role is already associated with the user !');
        });

        it('should return a 403 status code for non-admin user', async () => {
            const response = await agent
                .post(`/users/${testUserRole.id}/roles/${roleAdmin.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent
                .post(`/users/99999999/roles/${roleUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This user does not exist !');
        });

        it('should return a 404 status code for a non-existent role', async () => {
            const response = await agent
                .post(`/users/${testUserRole.id}/roles/99999999`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This role does not exist !');
        });
    });

    describe('DELETE /users/:id/roles/:role', () => {
        it('should delete a role from a user for admin', async () => {

            const response = await agent
                .delete(`/users/${testUserRole.id}/roles/${roleModo.id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'User role Deleted');
            expect(response.body).toHaveProperty('data.role');
            expect(response.body.data.role).toEqual(ROLES_LIST.modo.toString());
        });

        it('should return a 400 status code for role not allocated to the user', async () => {
            const response = await agent
                .delete(`/users/${testUserRole.id}/roles/${roleAdmin.id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('message', 'This role is not associated with the user !');
        });


        it('should return a 403 status code for non-admin user', async () => {
            const response = await agent
                .delete(`/users/${testUserRole.id}/roles/${roleModo.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return a 404 status code for a non-existent user', async () => {
            const response = await agent
                .delete(`/users/9999999999/roles/${roleModo.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This user does not exist !');
        });

        it('should return a 404 status code for a non-existent role', async () => {
            const response = await agent
                .delete(`/users/${testUserRole.id}/roles/99999999`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'This role does not exist !');
        });
    });
});