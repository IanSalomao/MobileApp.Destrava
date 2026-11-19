import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import type { Control } from 'react-hook-form';

import { FormTextField } from '@/components/form/form-text-field';
import { maskCardExpiry, maskCardNumber, onlyDigits } from '@/lib/masks';
import { colors, spacing } from '@/theme';

import type { CardInput } from '../schemas';

// Campos do cartão (protótipo "ASSINATURA E PAGAMENTO", "Dados do cartão"). CVV e nome só validam
// no aparelho: o banco recebe apenas bandeira, últimos 4 dígitos e validade.
export function CardFields({ control }: { control: Control<CardInput> }) {
  return (
    <>
      <FormTextField
        control={control}
        name="number"
        label="Número do cartão"
        placeholder="0000 0000 0000 0000"
        keyboardType="number-pad"
        maskFormatter={maskCardNumber}
        leftIcon={<Ionicons name="card-outline" size={20} color={colors.textMuted} />}
      />
      <View style={styles.row}>
        <FormTextField
          control={control}
          name="expiry"
          label="Validade"
          placeholder="MM/AA"
          keyboardType="number-pad"
          maskFormatter={maskCardExpiry}
          containerStyle={styles.rowItem}
        />
        <FormTextField
          control={control}
          name="cvv"
          label="CVV"
          placeholder="123"
          keyboardType="number-pad"
          maskFormatter={(value) => onlyDigits(value).slice(0, 4)}
          containerStyle={styles.rowItem}
        />
      </View>
      <FormTextField
        control={control}
        name="holderName"
        label="Nome no cartão"
        placeholder="NOME COMO NO CARTÃO"
        autoCapitalize="characters"
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
});
