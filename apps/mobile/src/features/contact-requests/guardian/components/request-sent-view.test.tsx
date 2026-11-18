import { fireEvent, render, screen } from '@testing-library/react-native';

import { RequestSentView } from './request-sent-view';

describe('RequestSentView', () => {
  const onTrackRequest = jest.fn();
  const onGoHome = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it('confirma o envio e diz que o professor tem 24 horas para responder', async () => {
    await render(
      <RequestSentView
        teacherName="Mariana Alves"
        onTrackRequest={onTrackRequest}
        onGoHome={onGoHome}
      />,
    );

    expect(screen.getByText('Solicitação enviada!')).toBeTruthy();
    expect(screen.getByText('Mariana Alves tem até 24 horas para responder.')).toBeTruthy();
  });

  it('sem o nome do professor, usa um texto genérico', async () => {
    await render(<RequestSentView onTrackRequest={onTrackRequest} onGoHome={onGoHome} />);

    expect(screen.getByText('O professor tem até 24 horas para responder.')).toBeTruthy();
  });

  it('"Acompanhar solicitação" chama onTrackRequest', async () => {
    await render(<RequestSentView onTrackRequest={onTrackRequest} onGoHome={onGoHome} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Acompanhar solicitação' }));

    expect(onTrackRequest).toHaveBeenCalledTimes(1);
    expect(onGoHome).not.toHaveBeenCalled();
  });

  it('"Voltar ao início" chama onGoHome', async () => {
    await render(<RequestSentView onTrackRequest={onTrackRequest} onGoHome={onGoHome} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));

    expect(onGoHome).toHaveBeenCalledTimes(1);
    expect(onTrackRequest).not.toHaveBeenCalled();
  });
});