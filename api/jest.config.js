module.exports = {
    // preset: 'jest-environment-node',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    moduleFileExtensions: ['js', 'json'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    collectCoverageFrom: [
        '**/*.{js,jsx}',
        '!**/node_modules/**',
        '!**/local_bdd/**',
        '!**/vendor/**',
        '!**/coverage/**',
        '!**/jest.config.js',
        '!**/server.js',
    ],
};