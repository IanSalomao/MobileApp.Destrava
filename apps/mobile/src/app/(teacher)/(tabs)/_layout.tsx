import { Tabs } from 'expo-router';

import { TabBarIcon, tabBarColors } from '@/components/ui/tab-bar-icon';

// Abas do professor: Início (painel), Solicitações (RF15) e Perfil. A aba "Clientes" do protótipo
// entrou em Solicitações: os contatos aceitos ficam lá, com o botão do WhatsApp.
export default function TeacherTabsLayout() {
  return (
    <Tabs screenOptions={tabBarColors}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIcon name="home-outline" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="received-requests"
        options={{
          title: 'Solicitações',
          headerTitle: 'Solicitações recebidas',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIcon name="document-text-outline" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="teacher-account"
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
