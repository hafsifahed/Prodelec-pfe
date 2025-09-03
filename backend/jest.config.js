module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$', // Unit tests
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!main.ts',     
    '!**/*.module.ts', 
    '!**/dist/**',              
    '!**/*.strategy.ts',    
            '!**/*.service.ts', // Exclude entry point
    '!**/node_modules/**',  // Exclude dependencies
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'json'],
};

