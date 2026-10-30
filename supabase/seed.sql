-- =============================================================================
-- Seed de Desenvolvimento e Demonstração (DB-08)
-- =============================================================================
-- Popula o banco local no comando `npm run db:reset` (ou `supabase db reset`):
--   1. Catálogo completo de matérias e idiomas (subjects, languages)
--   2. 50 professores distribuídos em várias cidades/bairros:
--      - #1 a #42: Verificados ('approved') e com assinatura ativa/trial (is_published = true)
--      - #43 a #46: CASO DE BORDA — Não verificados ('pending_review', 'draft', 'rejected')
--      - #47 a #50: CASO DE BORDA — Trial expirado, assinatura cancelada ou sem assinatura
--   3. 10 responsáveis (guardians) com 13 alunos em diversas séries escolares
--   4. Solicitações de contato (pending, accepted, declined, expired), favoritos e avaliações
--
-- Contas prontas para login no app (senha de todas: password123):
--   - Responsável principal: pai@destrava.com (ou juliana.martins@destrava.com)
--   - Professora publicada:  prof@destrava.com (Mariana Alves - São Paulo/SP)
--   - Prof. não verificado:  prof43@destrava.com (pendente) / prof46@destrava.com (rejeitado)
--   - Prof. trial expirado:  prof47@destrava.com (expired) / prof50@destrava.com (sem assinatura)
-- =============================================================================

-- 1. Catálogo de Matérias e Idiomas (complementa 20261014040000_catalog.sql)
insert into public.subjects (id, name, sort_order) values
  ('math', 'Matemática', 1),
  ('portuguese', 'Português', 2),
  ('physics', 'Física', 3),
  ('chemistry', 'Química', 4),
  ('biology', 'Biologia', 5),
  ('history', 'História', 6),
  ('english', 'Inglês', 7),
  ('geography', 'Geografia', 8),
  ('writing', 'Redação', 9),
  ('literacy', 'Alfabetização', 10),
  ('science', 'Ciências', 11),
  ('spanish', 'Espanhol', 12)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

insert into public.languages (id, name, sort_order) values
  ('pt', 'Português', 1),
  ('en', 'Inglês', 2),
  ('es', 'Espanhol', 3),
  ('fr', 'Francês', 4)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

-- 2. População de Usuários, Professores, Responsáveis, Alunos, Contatos e Avaliações
do $$
declare
  v_password_hash text := extensions.crypt('password123', extensions.gen_salt('bf'));
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';

  -- Listas de nomes realistas para os 50 professores
  v_teacher_names text[] := array[
    'Mariana Alves', 'Rafael Costa', 'Camila Mendes', 'Lucas Ferreira', 'Beatriz Rocha',
    'Guilherme Santos', 'Fernanda Oliveira', 'Diego Almeida', 'Larissa Ribeiro', 'Thiago Carvalho',
    'Patrícia Gomes', 'Bruno Martins', 'Amanda Lima', 'Rodrigo Araújo', 'Carolina Melo',
    'Felipe Barbosa', 'Natália Cardoso', 'Marcelo Teixeira', 'Letícia Correia', 'Leonardo Dias',
    'Vanessa Castro', 'Eduardo Freitas', 'Priscila Monteiro', 'Gustavo Moreira', 'Tatiane Pinto',
    'Daniel Vieira', 'Aline Cavalcanti', 'Matheus Azevedo', 'Bianca Nunes', 'Vitor Barros',
    'Renata Campos', 'Caio Peixoto', 'Helena Duarte', 'Igor Ramos', 'Débora Fonseca',
    'André Machado', 'Sabrina Pires', 'Leandro Moura', 'Cristiane Nogueira', 'Alexandre Cunha',
    'Mônica Tavares', 'Fábio Rezende', 'Raquel Neves', 'Henrique Siqueira', 'Cláudia Lopes',
    'Samuel Brito', 'Eliane Borges', 'Murilo Guimarães', 'Simone Macedo', 'Otávio Morais'
  ];

  -- Cidades, estados, bairros, CEPs e coordenadas variadas (SP, RJ, MG, BA, PR)
  v_cities text[] := array[
    'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo',
    'Rio de Janeiro', 'Rio de Janeiro',
    'Belo Horizonte', 'Feira de Santana', 'Salvador', 'Curitiba'
  ];
  v_states text[] := array[
    'SP', 'SP', 'SP', 'SP',
    'RJ', 'RJ',
    'MG', 'BA', 'BA', 'PR'
  ];
  v_neighborhoods text[] := array[
    'Pinheiros', 'Vila Mariana', 'Moema', 'Perdizes',
    'Botafogo', 'Tijuca',
    'Savassi', 'Kalilândia', 'Pituba', 'Batel'
  ];
  v_postals text[] := array[
    '05422000', '04101300', '04077020', '05014000',
    '22250040', '20511000',
    '30140071', '44001432', '41810012', '80420090'
  ];
  v_lats double precision[] := array[
    -23.5614, -23.5891, -23.6009, -23.5367,
    -22.9519, -22.9248,
    -19.9386, -12.2564, -13.0012, -25.4411
  ];
  v_lngs double precision[] := array[
    -46.6959, -46.6347, -46.6656, -46.6743,
    -43.1857, -43.2325,
    -43.9352, -38.9593, -38.4589, -49.2862
  ];

  v_subjects text[] := array[
    'math', 'portuguese', 'physics', 'chemistry', 'biology',
    'history', 'english', 'geography', 'writing', 'literacy'
  ];

  v_bios text[] := array[
    'Licenciada pela USP com 8 anos de experiência em reforço escolar personalizado e preparação para provas.',
    'Especialista em destravar alunos com dificuldade em exatas usando resolução passo a passo e exemplos práticos.',
    'Professora apaixonada por ensino individualizado. Foco em leitura, interpretação de texto, gramática e redação.',
    'Mestre em Educação com didática paciente e acolhedora para Ensino Fundamental I, II e Ensino Médio.',
    'Aulas dinâmicas presenciais ou online com listas de exercícios direcionadas para recuperar as notas do bimestre.'
  ];

  -- Listas para os 10 responsáveis
  v_guardian_names text[] := array[
    'Juliana Martins', 'Carlos Eduardo Silva', 'Renata Souza', 'Roberto Nascimento', 'Fernanda Costa',
    'Marcos Paulo Lima', 'Cláudia Mendes', 'Andréia Oliveira', 'Ricardo Pereira', 'Luciana Alves'
  ];

  v_teacher_id uuid;
  v_guardian_id uuid;
  v_student_id uuid;
  v_email text;
  v_phone text;
  v_cpf_base text;
  v_d1 integer;
  v_d2 integer;
  v_cpf text;
  v_loc_idx integer;
  v_subj_1 text;
  v_subj_2 text;
begin
  -- ===========================================================================
  -- 2.1. CRIAR 50 PROFESSORES
  -- ===========================================================================
  for i in 1..50 loop
    v_teacher_id := ('10000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    v_email := case when i = 1 then 'prof@destrava.com' else 'prof' || i || '@destrava.com' end;
    v_phone := '+551198' || lpad(i::text, 7, '0');
    v_loc_idx := ((i - 1) % 10) + 1;

    -- Gera um CPF válido matematicamente (passa na constraint public.is_valid_cpf)
    v_cpf_base := lpad((123456700 + i)::text, 9, '0');
    v_d1 := 0;
    for j in 1..9 loop
      v_d1 := v_d1 + substr(v_cpf_base, j, 1)::integer * (11 - j);
    end loop;
    v_d1 := (v_d1 * 10) % 11 % 10;

    v_d2 := 0;
    for j in 1..9 loop
      v_d2 := v_d2 + substr(v_cpf_base, j, 1)::integer * (12 - j);
    end loop;
    v_d2 := v_d2 + v_d1 * 2;
    v_d2 := (v_d2 * 10) % 11 % 10;
    v_cpf := v_cpf_base || v_d1::text || v_d2::text;

    -- Insere em auth.users (dispara handle_new_user -> profiles, contact_details -> handle_new_teacher -> teachers, teacher_verifications)
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      v_instance_id,
      v_teacher_id,
      'authenticated',
      'authenticated',
      v_email,
      v_password_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'teacher',
        'full_name', v_teacher_names[i],
        'phone', v_phone,
        'terms_accepted', 'true'
      ),
      now() - (i || ' days')::interval,
      now()
    ) on conflict (id) do nothing;

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      v_teacher_id,
      v_teacher_id,
      jsonb_build_object('sub', v_teacher_id::text, 'email', v_email),
      'email',
      v_teacher_id::text,
      now(),
      now(),
      now()
    ) on conflict (provider, provider_id) do nothing;

    -- Preenche o perfil profissional do professor
    update public.teachers set
      bio = v_bios[((i - 1) % 5) + 1],
      hourly_rate_cents = (45 + ((i * 5) % 75)) * 100, -- Entre R$ 45,00 e R$ 115,00
      tutoring_types = case (i % 3)
        when 0 then array['online']::public.tutoring_type[]
        when 1 then array['in_person']::public.tutoring_type[]
        else array['online', 'in_person']::public.tutoring_type[]
      end,
      education_levels = case (i % 3)
        when 0 then array['elementary_early', 'elementary_late']::public.education_level[]
        when 1 then array['elementary_late', 'high_school']::public.education_level[]
        else array['elementary_early', 'elementary_late', 'high_school']::public.education_level[]
      end,
      available_weekdays = array[1, 2, 3, 4, 5]::smallint[],
      available_periods = case (i % 2)
        when 0 then array['morning', 'afternoon']::public.day_period[]
        else array['afternoon', 'evening']::public.day_period[]
      end,
      postal_code = v_postals[v_loc_idx],
      neighborhood = v_neighborhoods[v_loc_idx],
      city = v_cities[v_loc_idx],
      state = v_states[v_loc_idx],
      location = extensions.st_setsrid(
        extensions.st_makepoint(
          v_lngs[v_loc_idx] + ((i % 7) - 3) * 0.006,
          v_lats[v_loc_idx] + ((i % 5) - 2) * 0.006
        ),
        4326
      )::extensions.geography
    where id = v_teacher_id;

    -- Matérias (2 matérias por professor)
    v_subj_1 := v_subjects[((i - 1) % 10) + 1];
    v_subj_2 := v_subjects[(i % 10) + 1];

    insert into public.teacher_subjects (teacher_id, subject_id) values
      (v_teacher_id, v_subj_1),
      (v_teacher_id, v_subj_2)
    on conflict do nothing;

    -- Idiomas (Português para todos + Inglês ou Espanhol para alguns)
    insert into public.teacher_languages (teacher_id, language_id)
    values (v_teacher_id, 'pt')
    on conflict do nothing;

    if i % 3 = 0 then
      insert into public.teacher_languages (teacher_id, language_id)
      values (v_teacher_id, 'en')
      on conflict do nothing;
    elsif i % 5 = 0 then
      insert into public.teacher_languages (teacher_id, language_id)
      values (v_teacher_id, 'es')
      on conflict do nothing;
    end if;

    -- Redes sociais (liberadas no RLS apenas após aceite da solicitação)
    insert into public.teacher_social_links (teacher_id, network, url) values
      (v_teacher_id, 'instagram', 'https://instagram.com/prof.' || lower(regexp_replace(v_teacher_names[i], '\s+', '.', 'g'))),
      (v_teacher_id, 'linkedin', 'https://linkedin.com/in/prof-' || i)
    on conflict do nothing;

    -- Documento simulado de identidade
    insert into public.teacher_documents (teacher_id, kind, storage_path, file_name)
    values (
      v_teacher_id,
      'identity',
      v_teacher_id::text || '/documento-identidade.pdf',
      'documento-identidade.pdf'
    ) on conflict (storage_path) do nothing;

    -- =========================================================================
    -- CASOS DE BORDA DE VERIFICAÇÃO E ASSINATURA:
    --   - Professores 1..42: Aprovados + Assinatura ativa ou trialing (Publicados)
    --   - Professores 43..46: NÃO VERIFICADOS (pending_review, draft, rejected)
    --   - Professores 47..50: Aprovados, mas TRIAL EXPIRADO / CANCELADO / SEM ASSINATURA
    -- =========================================================================
    if i between 1 and 42 then
      update public.teacher_verifications set
        cpf = v_cpf,
        status = 'approved',
        submitted_at = now() - interval '15 days',
        reviewed_at = now() - interval '14 days'
      where teacher_id = v_teacher_id;

      if i <= 30 then
        -- Assinatura paga ativa
        insert into public.subscriptions (
          teacher_id, plan_id, status, current_period_start, current_period_end,
          card_brand, card_last4, card_exp_month, card_exp_year
        ) values (
          v_teacher_id, 'teacher_launch', 'active',
          now() - interval '10 days', now() + interval '20 days',
          'visa', lpad((1000 + i)::text, 4, '0'), 12, 2029
        ) on conflict (teacher_id) do nothing;
      else
        -- Em período de teste grátis válido (trialing)
        insert into public.subscriptions (
          teacher_id, plan_id, status, trial_ends_at, current_period_start, current_period_end
        ) values (
          v_teacher_id, 'teacher_launch', 'trialing',
          now() + interval '5 days', now() - interval '2 days', now() + interval '5 days'
        ) on conflict (teacher_id) do nothing;
      end if;

    elsif i in (43, 44) then
      -- CASO DE BORDA: Professor não verificado (aguardando análise)
      update public.teacher_verifications set
        cpf = v_cpf,
        status = 'pending_review',
        submitted_at = now() - interval '2 days'
      where teacher_id = v_teacher_id;

      insert into public.subscriptions (
        teacher_id, plan_id, status, trial_ends_at, current_period_start, current_period_end
      ) values (
        v_teacher_id, 'teacher_launch', 'trialing',
        now() + interval '5 days', now() - interval '2 days', now() + interval '5 days'
      ) on conflict (teacher_id) do nothing;

    elsif i = 45 then
      -- CASO DE BORDA: Professor em rascunho (draft, não enviou verificação)
      update public.teacher_verifications set
        cpf = v_cpf,
        status = 'draft'
      where teacher_id = v_teacher_id;

    elsif i = 46 then
      -- CASO DE BORDA: Professor com verificação rejeitada
      update public.teacher_verifications set
        cpf = v_cpf,
        status = 'rejected',
        submitted_at = now() - interval '5 days',
        reviewed_at = now() - interval '4 days',
        rejection_reason = 'A foto do documento de identidade está ilegível. Envie uma nova foto nítida.'
      where teacher_id = v_teacher_id;

    elsif i in (47, 48) then
      -- CASO DE BORDA: Professor verificado, porém com TRIAL EXPIRADO
      update public.teacher_verifications set
        cpf = v_cpf,
        status = 'approved',
        submitted_at = now() - interval '20 days',
        reviewed_at = now() - interval '19 days'
      where teacher_id = v_teacher_id;

      insert into public.subscriptions (
        teacher_id, plan_id, status, trial_ends_at, current_period_start, current_period_end, ended_at
      ) values (
        v_teacher_id, 'teacher_launch', 'expired',
        now() - interval '3 days', now() - interval '10 days', now() - interval '3 days', now() - interval '3 days'
      ) on conflict (teacher_id) do nothing;

    elsif i = 49 then
      -- CASO DE BORDA: Professor verificado, porém com assinatura CANCELADA
      update public.teacher_verifications set
        cpf = v_cpf,
        status = 'approved',
        submitted_at = now() - interval '40 days',
        reviewed_at = now() - interval '39 days'
      where teacher_id = v_teacher_id;

      insert into public.subscriptions (
        teacher_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, ended_at
      ) values (
        v_teacher_id, 'teacher_launch', 'canceled',
        now() - interval '35 days', now() - interval '5 days', true, now() - interval '5 days'
      ) on conflict (teacher_id) do nothing;

    elsif i = 50 then
      -- CASO DE BORDA: Professor verificado, porém SEM ASSINATURA cadastrada
      update public.teacher_verifications set
        cpf = v_cpf,
        status = 'approved',
        submitted_at = now() - interval '5 days',
        reviewed_at = now() - interval '4 days'
      where teacher_id = v_teacher_id;
    end if;
  end loop;

  -- ===========================================================================
  -- 2.2. CRIAR 10 RESPONSÁVEIS E SEUS ALUNOS (FILHOS)
  -- ===========================================================================
  for g in 1..10 loop
    v_guardian_id := ('20000000-0000-4000-8000-' || lpad(g::text, 12, '0'))::uuid;
    v_email := case when g = 1 then 'pai@destrava.com' else 'pai' || g || '@destrava.com' end;
    v_phone := '+551197' || lpad(g::text, 7, '0');

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      v_instance_id,
      v_guardian_id,
      'authenticated',
      'authenticated',
      v_email,
      v_password_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'guardian',
        'full_name', v_guardian_names[g],
        'phone', v_phone,
        'terms_accepted', 'true'
      ),
      now() - (g || ' days')::interval,
      now()
    ) on conflict (id) do nothing;

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      v_guardian_id,
      v_guardian_id,
      jsonb_build_object('sub', v_guardian_id::text, 'email', v_email),
      'email',
      v_guardian_id::text,
      now(),
      now(),
      now()
    ) on conflict (provider, provider_id) do nothing;

    -- Cria 1 aluno principal para cada responsável
    v_student_id := ('30000000-0000-4000-8000-' || lpad(g::text, 12, '0'))::uuid;
    insert into public.students (
      id, guardian_id, full_name, school_grade, learning_goal, preferred_tutoring_type
    ) values (
      v_student_id,
      v_guardian_id,
      case g
        when 1 then 'Gabriel Martins'
        when 2 then 'Lucas Silva'
        when 3 then 'Lívia Souza'
        when 4 then 'Pedro Nascimento'
        when 5 then 'Sofia Costa'
        when 6 then 'Arthur Lima'
        when 7 then 'Manuela Mendes'
        when 8 then 'Davi Oliveira'
        when 9 then 'Alice Pereira'
        else 'Heitor Alves'
      end,
      case (g % 5)
        when 1 then 'elementary_7'::public.school_grade
        when 2 then 'elementary_5'::public.school_grade
        when 3 then 'high_school_1'::public.school_grade
        when 4 then 'elementary_9'::public.school_grade
        else 'high_school_2'::public.school_grade
      end,
      'Reforço contínuo para melhorar o desempenho nas avaliações bimestrais e tirar dúvidas.',
      case when g % 2 = 0 then 'online'::public.tutoring_type else 'in_person'::public.tutoring_type end
    ) on conflict (id) do nothing;

    insert into public.student_subjects (student_id, subject_id) values
      (v_student_id, v_subjects[((g - 1) % 10) + 1]),
      (v_student_id, v_subjects[(g % 10) + 1])
    on conflict do nothing;

    -- Para os 3 primeiros responsáveis, adiciona um 2º filho
    if g <= 3 then
      insert into public.students (
        id, guardian_id, full_name, school_grade, learning_goal, preferred_tutoring_type
      ) values (
        ('30000000-0000-4000-8000-' || lpad((10 + g)::text, 12, '0'))::uuid,
        v_guardian_id,
        case g
          when 1 then 'Clara Martins'
          when 2 then 'Mateus Silva'
          else 'Beatriz Souza'
        end,
        'elementary_3'::public.school_grade,
        'Acompanhamento de leitura, escrita e raciocínio lógico.',
        'in_person'::public.tutoring_type
      ) on conflict (id) do nothing;
    end if;
  end loop;

  -- ===========================================================================
  -- 2.3. SOLICITAÇÕES DE CONTATO (PENDING, ACCEPTED, DECLINED, EXPIRED) E REVIEWS
  -- ===========================================================================

  -- A) Solicitações PENDENTES (status = 'pending') — para testar aceite/recusa na visão do professor
  insert into public.contact_requests (
    id, guardian_id, teacher_id, student_id,
    guardian_name, student_name, student_school_grade, student_age,
    reason, preferred_tutoring_type, status, expires_at, created_at
  ) values
    (
      '40000000-0000-4000-8000-000000000001'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid, -- Juliana Martins (pai@destrava.com)
      '10000000-0000-4000-8000-000000000002'::uuid, -- Rafael Costa (prof2@destrava.com)
      '30000000-0000-4000-8000-000000000001'::uuid,
      'Juliana Martins', 'Gabriel Martins', 'elementary_7', 12,
      'Olá professor! O Gabriel está com dificuldade em equações do 1º grau e frações para a prova da semana que vem.',
      'in_person', 'pending', now() + interval '20 hours', now() - interval '4 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000002'::uuid,
      '20000000-0000-4000-8000-000000000003'::uuid, -- Renata Souza
      '10000000-0000-4000-8000-000000000001'::uuid, -- Mariana Alves (prof@destrava.com)
      '30000000-0000-4000-8000-000000000003'::uuid,
      'Renata Souza', 'Lívia Souza', 'high_school_1', 15,
      'Oi Mariana! A Lívia precisa de ajuda em cinemática e funções para o simulado do colégio.',
      'online', 'pending', now() + interval '18 hours', now() - interval '6 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000003'::uuid,
      '20000000-0000-4000-8000-000000000004'::uuid, -- Roberto Nascimento
      '10000000-0000-4000-8000-000000000001'::uuid, -- Mariana Alves (prof@destrava.com)
      '30000000-0000-4000-8000-000000000004'::uuid,
      'Roberto Nascimento', 'Pedro Nascimento', 'elementary_9', 14,
      'Bom dia! Gostaria de agendar duas aulas semanais de reforço em matemática para o Pedro.',
      'in_person', 'pending', now() + interval '22 hours', now() - interval '2 hours'
    )
  on conflict (id) do nothing;

  -- B) Solicitações JÁ ACEITAS (status = 'accepted') — libera WhatsApp e redes sociais via RLS
  insert into public.contact_requests (
    id, guardian_id, teacher_id, student_id,
    guardian_name, student_name, student_school_grade, student_age,
    reason, preferred_tutoring_type, status, expires_at, responded_at, created_at
  ) values
    (
      '40000000-0000-4000-8000-000000000004'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid, -- Juliana Martins (pai@destrava.com)
      '10000000-0000-4000-8000-000000000001'::uuid, -- Mariana Alves (prof@destrava.com)
      '30000000-0000-4000-8000-000000000001'::uuid,
      'Juliana Martins', 'Gabriel Martins', 'elementary_7', 12,
      'Olá Mariana! Precisamos de reforço em Matemática às terças e quintas à tarde.',
      'in_person', 'accepted', now() - interval '9 days', now() - interval '9 days' + interval '2 hours', now() - interval '10 days'
    ),
    (
      '40000000-0000-4000-8000-000000000005'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid, -- Carlos Eduardo Silva
      '10000000-0000-4000-8000-000000000001'::uuid, -- Mariana Alves (prof@destrava.com)
      '30000000-0000-4000-8000-000000000002'::uuid,
      'Carlos Eduardo Silva', 'Lucas Silva', 'elementary_5', 10,
      'Oi professora! O Lucas precisa de acompanhamento nas tarefas de casa de matemática.',
      'online', 'accepted', now() - interval '6 days', now() - interval '6 days' + interval '1 hour', now() - interval '7 days'
    ),
    (
      '40000000-0000-4000-8000-000000000006'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid, -- Juliana Martins (pai@destrava.com)
      '10000000-0000-4000-8000-000000000003'::uuid, -- Camila Mendes (prof3@destrava.com)
      '30000000-0000-4000-8000-000000000011'::uuid,
      'Juliana Martins', 'Clara Martins', 'elementary_3', 8,
      'Olá Camila! Quero reforço presencial de Português e leitura para a Clara.',
      'in_person', 'accepted', now() - interval '4 days', now() - interval '4 days' + interval '3 hours', now() - interval '5 days'
    ),
    (
      '40000000-0000-4000-8000-000000000007'::uuid,
      '20000000-0000-4000-8000-000000000005'::uuid, -- Fernanda Costa
      '10000000-0000-4000-8000-000000000004'::uuid, -- Lucas Ferreira
      '30000000-0000-4000-8000-000000000005'::uuid,
      'Fernanda Costa', 'Sofia Costa', 'high_school_2', 16,
      'Precisamos de aulas intensivas de Química e Física para o vestibular.',
      'online', 'accepted', now() - interval '12 days', now() - interval '12 days' + interval '4 hours', now() - interval '13 days'
    )
  on conflict (id) do nothing;

  -- C) Solicitações RECUSADAS e EXPIRADAS (status = 'declined' / 'expired')
  insert into public.contact_requests (
    id, guardian_id, teacher_id, student_id,
    guardian_name, student_name, student_school_grade, student_age,
    reason, preferred_tutoring_type, status, expires_at, responded_at, created_at
  ) values
    (
      '40000000-0000-4000-8000-000000000008'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid, -- Juliana Martins
      '10000000-0000-4000-8000-000000000005'::uuid, -- Beatriz Rocha
      '30000000-0000-4000-8000-000000000001'::uuid,
      'Juliana Martins', 'Gabriel Martins', 'elementary_7', 12,
      'Gostaria de aulas aos sábados pela manhã.',
      'in_person', 'declined', now() - interval '2 days', now() - interval '2 days' - interval '5 hours', now() - interval '3 days'
    ),
    (
      '40000000-0000-4000-8000-000000000009'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid, -- Carlos Eduardo Silva
      '10000000-0000-4000-8000-000000000006'::uuid, -- Guilherme Santos
      '30000000-0000-4000-8000-000000000002'::uuid,
      'Carlos Eduardo Silva', 'Lucas Silva', 'elementary_5', 10,
      'Procurando reforço para sexta-feira à tarde.',
      'online', 'expired', now() - interval '1 day', null, now() - interval '2 days'
    )
  on conflict (id) do nothing;

  -- D) Avaliações nos contatos aceitos (o trigger atualiza rating_average e rating_count)
  insert into public.reviews (id, teacher_id, guardian_id, rating, comment) values
    (
      '50000000-0000-4000-8000-000000000001'::uuid,
      '10000000-0000-4000-8000-000000000001'::uuid, -- Mariana Alves
      '20000000-0000-4000-8000-000000000001'::uuid, -- Juliana Martins
      5,
      'A professora Mariana é excelente! Muito paciente, pontual e o Gabriel tirou 9,5 na prova de Matemática.'
    ),
    (
      '50000000-0000-4000-8000-000000000002'::uuid,
      '10000000-0000-4000-8000-000000000001'::uuid, -- Mariana Alves
      '20000000-0000-4000-8000-000000000002'::uuid, -- Carlos Eduardo Silva
      5,
      'Didática incrível! Meu filho finalmente perdeu o medo de matemática.'
    ),
    (
      '50000000-0000-4000-8000-000000000003'::uuid,
      '10000000-0000-4000-8000-000000000003'::uuid, -- Camila Mendes
      '20000000-0000-4000-8000-000000000001'::uuid, -- Juliana Martins
      4,
      'Muito atenciosa e carinhosa com a Clara. Recomendo bastante!'
    ),
    (
      '50000000-0000-4000-8000-000000000004'::uuid,
      '10000000-0000-4000-8000-000000000004'::uuid, -- Lucas Ferreira
      '20000000-0000-4000-8000-000000000005'::uuid, -- Fernanda Costa
      5,
      'Domina muito o conteúdo de Ensino Médio e explica de forma direta.'
    )
  on conflict (guardian_id, teacher_id) do nothing;

  -- E) Favoritos dos responsáveis
  insert into public.favorite_teachers (guardian_id, teacher_id) values
    ('20000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid),
    ('20000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000002'::uuid),
    ('20000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000003'::uuid)
  on conflict do nothing;
end;
$$;