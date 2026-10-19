import { render } from '@testing-library/react-native';

import { useSubjects } from '../hooks';
import { SubjectsList } from './subjects-list';

// Camada de apresentação: testamos o componente mockando o hook da feature.
// A fábrica evita carregar o hook real (e, por trás dele, o Supabase).
jest.mock('../hooks', () => ({ useSubjects: jest.fn() }));

const mockUseSubjects = useSubjects as jest.MockedFunction<typeof useSubjects>;

// Monta um retorno do hook só com os campos que o componente usa.
function mockQuery(state: Partial<ReturnType<typeof useSubjects>>) {
  mockUseSubjects.mockReturnValue(state as ReturnType<typeof useSubjects>);
}

describe('SubjectsList', () => {
  afterEach(() => jest.clearAllMocks());

  it('mostra um chip por matéria', () => {
    mockQuery({
      data: [
        { id: 'math', name: 'Matemática' },
        { id: 'physics', name: 'Física' },
      ],
      isPending: false,
      isError: false,
    });

    const { getByText } = render(<SubjectsList />);

    expect(getByText('Matemática')).toBeTruthy();
    expect(getByText('Física')).toBeTruthy();
  });

  it('mostra mensagem de erro quando a query falha', () => {
    mockQuery({ data: undefined, isPending: false, isError: true });

    const { getByText } = render(<SubjectsList />);

    expect(getByText('Não foi possível carregar as matérias.')).toBeTruthy();
  });
});
