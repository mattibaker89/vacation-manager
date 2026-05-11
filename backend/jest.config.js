module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/src/test/globalSetup.js',
  setupFiles: ['<rootDir>/src/test/setup.ts'],
};
