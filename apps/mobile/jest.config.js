// Config do Jest (jest-expo). Mantida fora do package.json para documentar o
// gate de cobertura. Rode `npm test` (rápido, sem cobertura) no dia a dia e
// `npm run test:coverage` para aferir o gate (é o que a CI executa).

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  // Cobertura: no MVVM a lógica testável mora em api.ts (Model), hooks.ts
  // (ViewModel) e no domínio puro. Coletamos e cobramos só o que já tem teste.
  collectCoverageFrom: [
    'src/features/contact-requests/domain/contact-request.ts',
    'src/features/subjects/api.ts',
    'src/features/subjects/hooks.ts',
  ],
  // Gate: a lógica das features COM teste precisa de >= 80%. Ao cobrir uma
  // feature nova, adicione o api.ts e o hooks.ts dela em collectCoverageFrom e
  // aqui (ex.: './src/features/contact-requests/api.ts').
  coverageThreshold: {
    './src/features/contact-requests/domain/contact-request.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/features/subjects/api.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/features/subjects/hooks.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
