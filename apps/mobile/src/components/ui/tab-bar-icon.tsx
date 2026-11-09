import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors } from '@/theme';

type TabBarIconProps = {
  name: ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  size: number;
};

// Ícone das abas. O `color` que o tabBarIcon recebe é um ColorValue (aceita null e número no RN
// 0.88), que o Ionicons não aceita. Como as cores das abas são tokens fixos, escolhemos pelo `focused`.
export function TabBarIcon({ name, focused, size }: TabBarIconProps) {
  return <Ionicons name={name} color={focused ? colors.primary : colors.textMuted} size={size} />;
}

/** Cores de rótulo das abas, iguais às do ícone. */
export const tabBarColors = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
};
