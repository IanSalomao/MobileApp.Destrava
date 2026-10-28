// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

// Mensagem única da fronteira de arquitetura (MVVM), usada na regra abaixo.
const SUPABASE_BOUNDARY_MESSAGE =
  'Só features/*/api.ts pode importar o cliente Supabase (@/lib/supabase). ' +
  'Telas, componentes e hooks acessam dados pelos hooks da feature. Veja CLAUDE.md.';

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'src/lib/database.types.ts']),
  expoConfig,
  prettierConfig,
  // Fronteira do BaaS: o cliente Supabase é a camada Model e vive só em api.ts.
  // Mantém a troca de BaaS restrita aos api.ts e impede acesso direto a dados
  // a partir de telas, componentes e hooks (ViewModel). Arquivos de teste ficam
  // de fora porque mockam @/lib/supabase.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/api.ts', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@/lib/supabase', message: SUPABASE_BOUNDARY_MESSAGE }],
          patterns: [{ group: ['**/lib/supabase'], message: SUPABASE_BOUNDARY_MESSAGE }],
        },
      ],
    },
  },
]);
