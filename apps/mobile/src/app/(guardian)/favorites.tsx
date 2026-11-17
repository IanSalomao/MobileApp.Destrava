import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { TeacherCard } from '@/components/ui/teacher-card';
import { Text } from '@/components/ui/text';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';
import { useFavoriteTeachers } from '@/features/favorites/hooks';
import { colors, spacing } from '@/theme';

// Professores favoritos do responsável (o coração dos cards e do perfil do professor). Sem
// protótipo próprio: segue o card da busca.
export default function FavoritesScreen() {
  const favorites = useFavoriteTeachers();

  if (favorites.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="favorites-loading" color={colors.primary} />
      </View>
    );
  }

  if (favorites.isError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar"
          description="Verifique sua conexão e tente novamente."
        />
        <Button title="Tentar de novo" onPress={() => favorites.refetch()} />
      </View>
    );
  }

  if (favorites.data.length === 0) {
    return (
      <View style={styles.center}>
        <Text variant="subtitle" style={styles.centerText}>
          Nenhum favorito ainda
        </Text>
        <Text variant="body" color="textSecondary" style={styles.centerText}>
          Toque no coração de um professor para guardá-lo aqui e encontrá-lo depois.
        </Text>
        <Button title="Buscar professores" onPress={() => router.push('/search')} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <FlatList
        data={favorites.data}
        keyExtractor={(teacher) => teacher.id}
        contentContainerStyle={styles.list}
        refreshing={favorites.isRefetching}
        onRefresh={() => favorites.refetch()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TeacherCard
              id={item.id}
              name={item.fullName}
              avatarUrl={item.avatarUrl}
              isVerified
              subjects={item.subjects}
              hourlyRateCents={item.hourlyRateCents}
              ratingAverage={item.ratingAverage ?? 0}
              ratingCount={item.ratingCount}
              style={styles.card}
              onPress={() => router.push({ pathname: '/teachers/[id]', params: { id: item.id } })}
            />
            <FavoriteButton teacherId={item.id} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  card: {
    flex: 1,
    width: 'auto',
  },
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
