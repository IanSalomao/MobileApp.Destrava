import type { LegalSection } from './types';

// Texto oficial em docs/legal/termos-de-uso.md e docs/legal/politica-de-privacidade.md.
// O teste de sincronização (content.test.ts) compara estas strings com os markdowns.
export const LEGAL_VERSION_DATE = '02/11/2026';

export const TERMS_TITLE = 'Termos de Uso';
export const TERMS_INTRO =
  'Estes termos regem o uso do aplicativo Destrava, oferecido por [NOME DO CONTROLADOR]. Ao criar uma conta, você declara que leu e concorda com eles e com a Política de Privacidade.';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: '1. O que é o Destrava',
    paragraphs: [
      'O Destrava é uma plataforma que aproxima responsáveis e professores particulares de reforço escolar. Não somos escola, agência nem empregador, não damos as aulas e não somos parte do acordo entre família e professor. Valores, horários, local e pagamento das aulas são combinados diretamente entre eles, fora do app. Não garantimos resultados escolares.',
    ],
  },
  {
    title: '2. Quem pode usar',
    paragraphs: [
      'Apenas pessoas com 18 anos ou mais e capazes de contratar. Menores de idade não criam conta: quem informa dados de um aluno é o responsável legal.',
    ],
  },
  {
    title: '3. Sua conta',
    paragraphs: [
      'Informe dados verdadeiros e atualizados, mantenha sua senha em sigilo e avise-nos se suspeitar de uso indevido. Você é responsável pelo que acontece na sua conta. O papel (responsável ou professor) é definido no cadastro.',
    ],
  },
  {
    title: '4. Responsáveis',
    bullets: [
      'Envie pedidos de contato com informações verdadeiras e apenas os dados do aluno necessários.',
      'Ao cadastrar um aluno, você declara ser o responsável legal por ele e autoriza o tratamento dos dados básicos descritos na Política de Privacidade.',
      'Avalie professores com honestidade, apenas depois de uma aula.',
    ],
  },
  {
    title: '5. Professores',
    bullets: [
      'Seu perfil, formação e valores devem ser verdadeiros. Você envia um documento de identidade para verificação; o perfil só aparece nas buscas com a verificação aprovada e a assinatura em teste ou ativa.',
      'Responda aos pedidos dentro do prazo de 24 horas. Depois do aceite, o número de WhatsApp de cada lado é liberado para o outro.',
      'Assinatura: o plano custa R$ 29,90 por mês, com 7 dias grátis. Nesta fase ela é simulada: não há cobrança. Se passar a existir cobrança real, avisaremos antes e pediremos sua concordância.',
      'Você é o único responsável pela conduta e pela qualidade das aulas que oferece.',
    ],
  },
  {
    title: '6. Segurança de crianças e adolescentes',
    paragraphs: [
      'Recomendamos que o responsável acompanhe as aulas, prefira locais públicos ou aulas online e confirme a identidade do professor antes do primeiro encontro. É proibido qualquer comportamento inadequado com menores; contas envolvidas serão suspensas e os fatos poderão ser comunicados às autoridades.',
    ],
  },
  {
    title: '7. Condutas proibidas',
    paragraphs: [
      'Fornecer dados falsos, assediar ou discriminar, divulgar contatos para burlar o aceite, usar o app para fins ilegais, copiar dados em massa ou tentar acessar áreas e contas que não são suas.',
    ],
  },
  {
    title: '8. Avaliações e conteúdo',
    paragraphs: [
      'O que você publica (avaliações, fotos, textos) é de sua responsabilidade. Você nos autoriza a exibi-lo no app. Podemos remover conteúdo que viole estes termos.',
    ],
  },
  {
    title: '9. Suspensão e encerramento',
    paragraphs: [
      'Você pode parar de usar o app e pedir a exclusão da conta quando quiser, em [E-MAIL DE CONTATO]. Podemos suspender ou encerrar contas que descumpram estes termos ou a lei.',
    ],
  },
  {
    title: '10. Versão em desenvolvimento',
    paragraphs: [
      'O Destrava está em fase de MVP. Funcionalidades podem mudar, falhar ou ser interrompidas. Nos limites da lei, não respondemos por danos indiretos nem por combinados feitos entre usuários fora do app. Isso não afasta direitos que a lei garante ao consumidor.',
    ],
  },
  {
    title: '11. Alterações',
    paragraphs: [
      'Podemos atualizar estes termos. A versão vigente fica publicada aqui e, em mudanças relevantes, pediremos um novo aceite.',
    ],
  },
  {
    title: '12. Lei aplicável e contato',
    paragraphs: [
      'Aplica-se a lei brasileira, e o foro é o do domicílio do consumidor. Dúvidas: [E-MAIL DE CONTATO].',
    ],
  },
];

export const PRIVACY_TITLE = 'Política de Privacidade';
export const PRIVACY_INTRO =
  'O Destrava aproxima responsáveis que procuram reforço escolar e professores particulares da mesma região. Esta política explica quais dados tratamos, para quê e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).';
export const PRIVACY_CONTROLLER =
  'Controlador: [NOME DO CONTROLADOR]. Contato e encarregado (DPO): [E-MAIL DE CONTATO].';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: '1. Dados que coletamos',
    bullets: [
      'Conta (todos): nome, e-mail, senha (protegida pelo provedor de autenticação; não a vemos em texto), papel (responsável ou professor), celular usado no WhatsApp, e a versão, data e hora do seu aceite destes documentos.',
      'Responsável: dados básicos do aluno (nome, ano escolar, idade se informada, objetivo e preferência por aula online ou presencial) e, em cada pedido de contato, o motivo do reforço. Também guardamos avaliações, professores favoritos e notificações.',
      'Professor: foto, apresentação, valor da hora, matérias, idiomas, tipos de aula, disponibilidade, cidade e estado, links de redes sociais e o documento de identidade enviado para verificação.',
      'Assinatura (professor): plano, datas e estado. A assinatura é simulada nesta fase (item 7).',
      'No aparelho: a sessão de login, guardada em armazenamento seguro do sistema. Não usamos publicidade nem ferramentas de análise de terceiros.',
    ],
  },
  {
    title: '2. Para que usamos e em que base legal',
    bullets: [
      'Criar e manter a conta, aproximar famílias e professores, enviar e responder pedidos e exibir avaliações: execução do serviço que você pediu (art. 7º, V).',
      'Dados de menores e o aceite destes documentos: seu consentimento (art. 7º, I e art. 14, §1º).',
      'Verificar a identidade dos professores e prevenir fraudes: segurança e legítimo interesse (art. 7º, IX).',
      'Guardar a prova do seu aceite: exercício regular de direitos (art. 7º, VI).',
    ],
  },
  {
    title: '3. Dados de crianças e adolescentes',
    paragraphs: [
      'Não coletamos dados diretamente de menores. Só o responsável legal, maior de 18 anos, informa dados do aluno, e usamos o mínimo necessário: nome, ano escolar, idade (opcional), objetivo de estudo e preferência de tipo de aula. Esses dados servem apenas para enviar o pedido de contato ao professor escolhido. O responsável dá um consentimento específico para isso no cadastro e pode revogá-lo a qualquer momento.',
      'O professor que recebe um pedido vê o que o responsável preencheu no formulário (nome do aluno, ano escolar, idade se informada e motivo), para decidir se aceita. Os dados salvos no perfil do aluno não são visíveis a professores.',
    ],
  },
  {
    title: '4. Localização',
    paragraphs: [
      'O professor informa a cidade e o estado em que atua, usados para que responsáveis encontrem professores na mesma região. Não guardamos endereço exato nem coordenadas geográficas, e o app não acessa a localização do seu aparelho.',
    ],
  },
  {
    title: '5. Documento de identidade (professores)',
    paragraphs: [
      'O documento enviado fica em armazenamento privado. Só o próprio professor o acessa pelo app, e a equipe responsável o consulta apenas para verificação e segurança. Ele nunca é exibido a famílias nem a outros usuários.',
    ],
  },
  {
    title: '6. WhatsApp',
    paragraphs: [
      'Os números de celular de responsável e professor ficam privados. Somente depois que o professor aceita um pedido o app libera o número de cada lado para o outro e mostra um botão que abre a conversa no WhatsApp. As conversas acontecem no WhatsApp, fora do Destrava, e seguem as regras do WhatsApp. Não armazenamos o conteúdo delas.',
    ],
  },
  {
    title: '7. Assinatura simulada',
    paragraphs: [
      'Na versão atual a assinatura do professor é uma demonstração: não há cobrança. Não pedimos nem guardamos número de cartão, CVV ou dados bancários reais. Se houver cobrança real no futuro, avisaremos e atualizaremos esta política.',
    ],
  },
  {
    title: '8. Com quem compartilhamos',
    bullets: [
      'Outros usuários, como descrito acima (perfil público do professor, pedido de contato, WhatsApp após o aceite).',
      'Provedores de infraestrutura, que tratam dados em nosso nome: Supabase (banco de dados, autenticação e armazenamento), hospedado em [REGIÃO DA HOSPEDAGEM]. Isso pode envolver transferência internacional de dados, com as garantias do art. 33 da LGPD.',
      'Autoridades, quando houver obrigação legal. Não vendemos dados pessoais.',
    ],
  },
  {
    title: '9. Por quanto tempo guardamos',
    paragraphs: [
      'Enquanto a conta estiver ativa. Ao pedir a exclusão, apagamos os dados da conta e os vinculados a ela, exceto o que a lei exigir guardar, como o registro do seu aceite.',
    ],
  },
  {
    title: '10. Seus direitos (art. 18)',
    paragraphs: [
      'Você pode pedir confirmação do tratamento, acesso, correção, anonimização ou eliminação, portabilidade, informação sobre compartilhamentos e a revogação do consentimento. Escreva para [E-MAIL DE CONTATO]; respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    title: '11. Segurança',
    paragraphs: [
      'Usamos conexão criptografada, controle de acesso por usuário no banco de dados e armazenamento seguro da sessão no aparelho. Nenhum sistema é totalmente seguro; em caso de incidente relevante, comunicaremos você e a ANPD conforme a lei.',
    ],
  },
  {
    title: '12. Alterações',
    paragraphs: [
      'Quando mudarmos esta política, publicaremos a nova versão aqui e, se for relevante, pediremos um novo aceite.',
    ],
  },
];
