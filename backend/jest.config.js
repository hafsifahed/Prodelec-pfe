module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',   // Tests unitaires
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '*/.(t|j)s',
    '!main.ts',             // Exclure les fichiers de démarrage
    '!**/node_modules/**',  // Exclure les dépendances
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageReporters: ['lcov', 'text', 'json'],
};