import { Tabs } from 'expo-router';

import { TabBarIcon, tabBarColors } from '@/components/ui/tab-bar-icon';

// Abas do responsável: Início (busca), Solicitações (RF14) e Perfil. As telas de chat do protótipo
// viraram a lista de solicitações, com o botão do WhatsApp nas aceitas.
export default function GuardianTabsLayout() {
  return (
    <Tabs screenOptions={tabBarColors}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIcon name="home-outline" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-requests"
        options={{
          title: 'Solicitações',
          headerTitle: 'Minhas solicitações',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIcon name="chatbubbles-outline" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Perfil',
          headerTitle: 'Meu perfil',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIcon name="person-circle-outline" focused={focused} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
