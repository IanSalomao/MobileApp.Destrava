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
  // Cobertura: no MVVM a lógica testável mora em api.ts (Model) e hooks.ts
  // (ViewModel). Coletamos e cobramos só as features que já têm teste.
  collectCoverageFrom: ['src/features/subjects/api.ts', 'src/features/subjects/hooks.ts'],
  // Gate: a lógica das features COM teste precisa de >= 80%. Ao cobrir uma
  // feature nova, adicione o api.ts e o hooks.ts dela em collectCoverageFrom e
  // aqui (ex.: './src/features/contact-requests/api.ts').
  coverageThreshold: {
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
