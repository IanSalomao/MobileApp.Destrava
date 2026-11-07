import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { colors } from '@/theme';

// O `color` que o tabBarIcon recebe é um ColorValue (aceita null e número no RN 0.88), que o
// Ionicons não aceita. Como as cores das abas são tokens fixos, escolhemos pelo `focused`.
const tabIconColor = (focused: boolean) => (focused ? colors.primary : colors.textMuted);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerTitle: 'Destrava',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="search" color={tabIconColor(focused)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Conta',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="person-circle-outline" color={tabIconColor(focused)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
