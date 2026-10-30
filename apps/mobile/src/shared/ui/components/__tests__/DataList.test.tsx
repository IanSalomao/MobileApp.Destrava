import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DataList } from '../DataList';

describe('UI-02b: DataList Wrapper', () => {
  it('exibe estado de loading quando loading=true e lista vazia', () => {
    render(
      <DataList
        data={[]}
        loading
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={() => null}
      />,
    );

    expect(screen.getByTestId('datalist-loading')).toBeTruthy();
  });

  it('exibe estado de erro e permite tentar novamente', () => {
    const onRetry = jest.fn();
    render(
      <DataList
        data={[]}
        errorMessage="Não foi possível carregar os professores."
        onRetry={onRetry}
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={() => null}
      />,
    );

    expect(screen.getByText('Não foi possível carregar os professores.')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('exibe estado vazio customizado quando não há itens', () => {
    render(
      <DataList
        data={[]}
        emptyTitle="Nenhum professor encontrado"
        emptyDescription="Tente ampliar os filtros da sua busca."
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={() => null}
      />,
    );

    expect(screen.getByText('Nenhum professor encontrado')).toBeTruthy();
    expect(screen.getByText('Tente ampliar os filtros da sua busca.')).toBeTruthy();
  });

  it('renderiza os itens da lista quando há dados', () => {
    const items = [
      { id: '1', name: 'Prof. João' },
      { id: '2', name: 'Profa. Ana' },
    ];

    render(
      <DataList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />,
    );

    expect(screen.getByText('Prof. João')).toBeTruthy();
    expect(screen.getByText('Profa. Ana')).toBeTruthy();
  });
});
