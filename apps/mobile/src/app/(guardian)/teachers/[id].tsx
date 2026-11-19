import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PublicTeacherProfileView } from '@/features/teachers/public-profile/components/public-teacher-profile-view';
import { useMyProfile } from '@/features/profile/hooks';
import { buildTeacherContactMessage } from '@/features/teachers/public-profile/domain';
import {
  usePublicTeacherProfile,
  useTeacherContact,
} from '@/features/teachers/public-profile/hooks';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { colors, spacing } from '@/theme';

// Perfil público do professor, visto pelo responsável: verificação, nota média e total de
// avaliações, matérias, valor e disponibilidade (RF03, RF06). Com a solicitação aceita, mostra o
// "Contato liberado": rede social, WhatsApp e avaliar (RF09-RF12). Protótipos: "DETALHES
// PROFESSOR", "ANTES DE ACEITAR" e "DEPOIS DE ACEITAR".
export default function TeacherProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = usePublicTeacherProfile(id);
  const contact = useTeacherContact(id);
  const myName = useMyProfile().data?.full_name;
  const [contactError, setContactError] = useState<string | null>(null);

  const openUrl = async (url: string | null, failure: string) => {
    setContactError(null);
    if (!url) {
      setContactError(failure);
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      setContactError(failure);
    }
  };

  if (profile.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="teacher-profile-loading" color={colors.primary} />
      </View>
    );
  }

  if (profile.isError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar"
          description="Verifique sua conexão e tente novamente."
        />
        <Button title="Tentar de novo" onPress={() => profile.refetch()} />
      </View>
    );
  }

  if (!profile.data) {
    return (
      <View style={styles.center}>
        <Text variant="subtitle">Professor não encontrado</Text>
        <Text variant="body" color="textSecondary" style={styles.centerText}>
          Este perfil não está disponível no momento.
        </Text>
        <Button title="Voltar" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <PublicTeacherProfileView
      profile={profile.data}
      onRequestContact={() =>
        router.push({ pathname: '/contact-request/[teacherId]', params: { teacherId: id } })
      }
      onSeeReviews={() =>
        router.push({ pathname: '/reviews/[teacherId]', params: { teacherId: id } })
      }
      contact={contact.data}
      contactError={contactError}
      onSeeRequest={(requestId) =>
        router.push({ pathname: '/my-requests/[id]', params: { id: requestId } })
      }
      onOpenWhatsApp={() => {
        const phone = contact.data?.status === 'accepted' ? contact.data.phone : null;
        const message = buildTeacherContactMessage(profile.data?.fullName ?? '', myName);
        openUrl(
          phone ? buildWhatsAppUrl(phone, message) : null,
          'Não foi possível abrir o WhatsApp.',
        );
      }}
      onOpenSocialLink={(url) => openUrl(url, 'Não foi possível abrir o link.')}
      onWriteReview={() =>
        router.push({ pathname: '/write-review/[teacherId]', params: { teacherId: id } })
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  centerText: {
    textAlign: 'center',
  },
});
