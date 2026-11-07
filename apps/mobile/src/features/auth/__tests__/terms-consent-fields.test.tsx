import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { TermsConsentFields } from '../components/terms-consent-fields';
import { MINOR_DATA_CLAUSE } from '../consent';
import type { SignUpInput } from '../schemas';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockPush = router.push as jest.Mock;

const TERMS_LABEL = 'Li e concordo com os Termos de Uso e a Política de Privacidade';

function Harness({ role }: { role: SignUpInput['role'] }) {
  const { control } = useForm<SignUpInput>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role,
      termsAccepted: false,
      minorDataConsent: false,
    },
  });
  return <TermsConsentFields control={control} />;
}

describe('AUT-09: TermsConsentFields', () => {
  afterEach(() => jest.clearAllMocks());

  it('começa desmarcado e marca ao tocar', async () => {
    await render(<Harness role="teacher" />);
    const checkbox = screen.getByRole('checkbox', { name: TERMS_LABEL });

    expect(checkbox.props.accessibilityState.checked).toBe(false);
    await fireEvent.press(checkbox);
    expect(
      screen.getByRole('checkbox', { name: TERMS_LABEL }).props.accessibilityState.checked,
    ).toBe(true);
  });

  it('abre os documentos pelos links do rótulo', async () => {
    await render(<Harness role="teacher" />);

    await fireEvent.press(screen.getByText('Termos de Uso'));
    await fireEvent.press(screen.getByText('Política de Privacidade'));

    expect(mockPush).toHaveBeenNthCalledWith(1, '/terms');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/privacy');
  });

  it('professor não vê a cláusula sobre dados do menor', async () => {
    await render(<Harness role="teacher" />);

    expect(screen.queryByText(MINOR_DATA_CLAUSE)).toBeNull();
  });

  it('responsável vê a cláusula específica e marca separadamente', async () => {
    await render(<Harness role="guardian" />);
    const clause = screen.getByRole('checkbox', {
      name: 'Consentimento do responsável para dados do aluno menor de idade',
    });

    expect(screen.getByText(MINOR_DATA_CLAUSE)).toBeTruthy();
    await fireEvent.press(clause);
    expect(
      screen.getByRole('checkbox', {
        name: 'Consentimento do responsável para dados do aluno menor de idade',
      }).props.accessibilityState.checked,
    ).toBe(true);
    expect(
      screen.getByRole('checkbox', { name: TERMS_LABEL }).props.accessibilityState.checked,
    ).toBe(false);
  });
});
