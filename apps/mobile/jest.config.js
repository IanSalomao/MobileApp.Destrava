// Config do Jest (jest-expo). Mantida fora do package.json para documentar o
// gate de cobertura. Rode `npm test` (rápido, sem cobertura) no dia a dia e
// `npm run test:coverage` para aferir o gate (é o que a CI executa).

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.[jt]s?(x)'],
  // O TextInput e a FlatList do RN 0.88 são carregados sob demanda, dentro do
  // primeiro teste que os renderiza. Com o cache do Jest frio (sempre, na CI) e
  // os workers transformando o react-native em paralelo, esse teste passa dos
  // 5 s padrão; com a máquina carregada, chegou a passar de 20 s. Com cache
  // quente, a suíte toda roda em ~4 s.
  testTimeout: 60000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  // Cobertura: no MVVM a lógica testável mora em api.ts (Model), hooks.ts
  // (ViewModel) e no domínio puro. Coletamos e cobramos só o que já tem teste.
  collectCoverageFrom: [
    'src/features/auth/route-access.ts',
    'src/features/contact-requests/domain/contact-request.ts',
    'src/features/contact-requests/api.ts',
    'src/features/contact-requests/hooks.ts',
    'src/features/settings/hooks.ts',
    'src/features/catalog/api.ts',
    'src/features/catalog/hooks.ts',
  ],
  // Gate: a lógica das features COM teste precisa de >= 80%. Ao cobrir uma
  // feature nova, adicione o api.ts e o hooks.ts dela em collectCoverageFrom e
  // aqui (ex.: './src/features/contact-requests/api.ts').
  coverageThreshold: {
    './src/features/auth/route-access.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/features/contact-requests/domain/contact-request.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/features/contact-requests/api.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/features/contact-requests/hooks.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/features/settings/hooks.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/features/catalog/api.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/features/catalog/hooks.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
