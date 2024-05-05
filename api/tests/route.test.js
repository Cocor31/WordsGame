const { agent } = require('./setup');
const PREFIX = process.env.PREFIX || '';


describe('GET /', () => {
    it('should return a 200 status code and a message indicating that the API is online', async () => {
        const response = await agent.get(PREFIX + '/');

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('I\'m online. All is OK !');
    });
});

describe('app.all(\'*\')', () => {
    it('should return a 501 status code and a message indicating that the requested URL is not supported', async () => {
        const response = await agent.get('/unknown-route');

        expect(response.statusCode).toBe(501);
    });
});