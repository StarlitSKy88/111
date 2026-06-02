module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/*.test.js',
    '!**/node_modules/**'
  ],
  collectCoverageFrom: [
    'api/**/*.js',
    '!api/utils/email.js',  // depends on SMTP credentials
    '!api/analyze.js'       // covered via route integration tests
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  verbose: true,
  testTimeout: 10000
};
