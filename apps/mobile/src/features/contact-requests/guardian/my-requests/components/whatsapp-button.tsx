import Ionicons from '@expo/vector-icons/Ionicons';
import type { StyleProp, ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { colors } from '@/theme';

export type WhatsAppButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Botão "Conversar no WhatsApp" (RF10), usado na lista e no detalhe das solicitações aceitas.
export function WhatsAppButton({ onPress, disabled = false, style }: WhatsAppButtonProps) {
  return (
    <Button
      title="Conversar no WhatsApp"
      onPress={onPress}
      disabled={disabled}
      style={style}
      leftIcon={<Ionicons name="logo-whatsapp" size={18} color={colors.onPrimary} />}
    />
  );
}
