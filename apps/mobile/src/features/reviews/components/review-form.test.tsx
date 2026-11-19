import { fireEvent, render, screen } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import type { ReviewInput } from '../schemas';
import { ReviewForm, type ReviewFormProps } from './review-form';

const handlers = {
  onChangeRating: jest.fn(),
  onChangeHadClass: jest.fn(),
  onSubmit: jest.fn(),
};

// O formulário recebe o control de fora (do hook da tela); aqui um useForm faz esse papel.
function Harness(props: Partial<ReviewFormProps>) {
  const { control } = useForm<ReviewInput>({ defaultValues: { rating: 0, comment: '' } });

  return (
    <ReviewForm
      teacherName="Ana Paula Souza"
      teacherAvatarUrl={null}
      isEditing={false}
      control={control}
      rating={0}
      ratingLabel={null}
      commentLength={0}
      hadClass
      canSubmit={false}
      isSubmitting={false}
      errorMessage={null}
      {...handlers}
      {...props}
    />
  );
}

describe('ReviewForm', () => {
  afterEach(() => jest.clearAllMocks());

  it('pergunta pelo primeiro nome do professor e orienta a tocar nas estrelas', async () => {
    await render(<Harness />);

    expect(screen.getByText('Como foi com Ana?')).toBeTruthy();
    expect(screen.getByText('Já teve aula com Ana?')).toBeTruthy();
    expect(screen.getByText('Toque nas estrelas para avaliar')).toBeTruthy();
    expect(screen.getByText('Opcional • 0/1000')).toBeTruthy();
  });

  it('escolher uma estrela avisa a nota', async () => {
    await render(<Harness />);

    await fireEvent.press(screen.getByTestId('rating-star-4'));

    expect(handlers.onChangeRating).toHaveBeenCalledWith(4);
  });

  it('mostra o rótulo da nota escolhida e o erro de validação', async () => {
    await render(
      <Harness rating={5} ratingLabel="Excelente" ratingError="Escolha uma nota de 1 a 5." />,
    );

    expect(screen.getByText('Excelente')).toBeTruthy();
    expect(screen.getByText('Escolha uma nota de 1 a 5.')).toBeTruthy();
  });

  it('sem nota, o botão de enviar fica desabilitado', async () => {
    await render(<Harness />);

    const submit = screen.getByRole('button', { name: 'Enviar avaliação' });
    expect(submit.props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(submit);
    expect(handlers.onSubmit).not.toHaveBeenCalled();
  });

  it('com o envio liberado, envia', async () => {
    await render(<Harness rating={4} canSubmit />);

    await fireEvent.press(screen.getByRole('button', { name: 'Enviar avaliação' }));

    expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('"Ainda não" troca a resposta e mostra a explicação', async () => {
    const { rerender } = await render(<Harness />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Ainda não' }));
    expect(handlers.onChangeHadClass).toHaveBeenCalledWith(false);
    expect(screen.queryByTestId('review-not-yet-banner')).toBeNull();

    await rerender(<Harness hadClass={false} />);
    expect(screen.getByTestId('review-not-yet-banner')).toBeTruthy();
    expect(screen.getByText('Avalie depois da primeira aula')).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'Sim, já tivemos' }));
    expect(handlers.onChangeHadClass).toHaveBeenLastCalledWith(true);
  });

  it('editando, avisa que já avaliou e troca o rótulo do botão', async () => {
    await render(<Harness isEditing rating={4} canSubmit />);

    expect(screen.getByText('Você já avaliou')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salvar avaliação' })).toBeTruthy();
  });

  it('mostra o erro de uma gravação que falhou', async () => {
    await render(<Harness errorMessage="Você só pode avaliar depois do aceite." />);

    expect(screen.getByText('Você só pode avaliar depois do aceite.')).toBeTruthy();
  });
});
