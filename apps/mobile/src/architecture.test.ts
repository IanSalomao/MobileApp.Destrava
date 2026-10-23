import { ESLint } from 'eslint';

// Teste de fronteira de arquitetura (MVVM): prova que o lint barra o import do
// cliente Supabase (@/lib/supabase) fora de api.ts e o permite dentro. Roda o
// ESLint de verdade sobre um trecho proposital de violação. O filePath relativo
// é resolvido contra o cwd (apps/mobile), onde fica o eslint.config.js.

const eslint = new ESLint();

// Import proibido fora de api.ts: só a camada Model (api.ts) fala com o Supabase.
const violatingCode = `import { supabase } from '@/lib/supabase';\n\nexport const client = supabase;\n`;

async function restrictedImportErrors(filePath: string) {
  const [result] = await eslint.lintText(violatingCode, { filePath });
  return result.messages.filter((message) => message.ruleId === 'no-restricted-imports');
}

describe('fronteira de arquitetura: acesso ao Supabase', () => {
  it('barra o import do cliente Supabase num hooks.ts (ViewModel)', async () => {
    const errors = await restrictedImportErrors('src/features/example/hooks.ts');

    expect(errors.length).toBeGreaterThan(0);
  });

  it('permite o import do cliente Supabase em api.ts (Model)', async () => {
    const errors = await restrictedImportErrors('src/features/example/api.ts');

    expect(errors).toHaveLength(0);
  });
});
