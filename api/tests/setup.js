
require('dotenv').config();

const request = require('supertest');
const app = require('../app');
const db = require('../db.config');

const agent = request.agent(app);

// beforeAll(async () => {
//     await db.sequelize.sync({ alter: true });
// });

// afterAll(async () => {
//     await db.sequelize.close();
// });

module.exports = { agent };