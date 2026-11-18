import { fireEvent, render, screen } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import type { StudentProfileInput } from '../../schemas';
import { StudentForm, type StudentFormProps } from './student-form';

const handlers = {
  onSubmit: jest.fn(),
  onRetrySubjects: jest.fn(),
};

const SUBJECT_OPTIONS = [
  { value: 'math', label: 'Matemática' },
  { value: 'english', label: 'Inglês' },
];

// O formulário recebe o control de fora (do hook da tela); aqui um useForm faz esse papel.
function Harness(props: Partial<StudentFormProps>) {
  const { control } = useForm<StudentProfileInput>({
    defaultValues: {
      fullName: 'Lucas Martins',
      schoolGrade: 'elementary_7',
      subjectIds: ['math'],
      learningGoal: 'Reforço em frações.',
    },
  });

  return (
    <StudentForm
      control={control}
      subjectOptions={SUBJECT_OPTIONS}
      subjectsFailed={false}
      submitLabel="Salvar alterações"
      isSubmitting={false}
      errorMessage={null}
      {...handlers}
      {...props}
    />
  );
}

describe('StudentForm', () => {
  afterEach(() => jest.clearAllMocks());

  it('mostra os dados do aluno e as matérias do catálogo', async () => {
    await render(<Harness />);

    expect(screen.getByDisplayValue('Lucas Martins')).toBeTruthy();
    expect(screen.getByDisplayValue('Reforço em frações.')).toBeTruthy();
    expect(screen.getByText('Matérias de interesse')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Matemática' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Inglês' })).toBeTruthy();
  });

  it('salva pelo botão com o rótulo recebido', async () => {
    await render(<Harness submitLabel="Cadastrar aluno" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar aluno' }));

    expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('enquanto salva, o botão fica ocupado e não dispara de novo', async () => {
    await render(<Harness isSubmitting />);

    const submit = screen.getByRole('button', { name: 'Salvar alterações' });
    expect(submit.props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(submit);
    expect(handlers.onSubmit).not.toHaveBeenCalled();
  });

  it('mostra o erro de uma gravação que falhou', async () => {
    await render(<Harness errorMessage="Aluno não encontrado." />);

    expect(screen.getByText('Aluno não encontrado.')).toBeTruthy();
  });

  it('sem matérias carregadas, avisa e oferece tentar de novo', async () => {
    await render(<Harness subjectsFailed subjectOptions={[]} />);

    expect(screen.getByText('Não foi possível carregar as matérias.')).toBeTruthy();
    expect(screen.queryByText('Matérias de interesse')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(handlers.onRetrySubjects).toHaveBeenCalledTimes(1);
  });
});