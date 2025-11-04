export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js'], // Chạy tất cả test files
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
