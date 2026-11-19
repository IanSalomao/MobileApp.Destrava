import { StyleSheet, View } from 'react-native';
import type { Control } from 'react-hook-form';

import { FormTextField } from '@/components/form/form-text-field';
import { Avatar } from '@/components/ui/avatar';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { spacing } from '@/theme';

import { COMMENT_MAX_LENGTH, getFirstName, MAX_RATING } from '../domain';
import type { ReviewInput } from '../schemas';

type HadClassOption = 'yes' | 'no';

export type ReviewFormProps = {
  teacherName: string;
  teacherAvatarUrl: string | null;
  isEditing: boolean;
  control: Control<ReviewInput>;
  rating: number;
  ratingLabel: string | null;
  ratingError?: string;
  commentLength: number;
  onChangeRating: (value: number) => void;
  hadClass: boolean;
  onChangeHadClass: (value: boolean) => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
};

// Formulário da avaliação (apresentacional). Protótipo: "AVALIAÇÃO". Quem decide o que salvar e
// quando o envio é liberado é o hook useReviewForm.
export function ReviewForm({
  teacherName,
  teacherAvatarUrl,
  isEditing,
  control,
  rating,
  ratingLabel,
  ratingError,
  commentLength,
  onChangeRating,
  hadClass,
  onChangeHadClass,
  canSubmit,
  isSubmitting,
  errorMessage,
  onSubmit,
}: ReviewFormProps) {
  const firstName = getFirstName(teacherName);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar name={teacherName} imageUrl={teacherAvatarUrl} size="lg" />
        <Text variant="heading" style={styles.centered}>
          Como foi com {firstName}?
        </Text>
        <Text color="textSecondary" style={styles.centered}>
          Sua opinião ajuda outras famílias a escolherem com mais confiança.
        </Text>
      </View>

      {isEditing ? (
        <Banner
          variant="info"
          title="Você já avaliou"
          description="Altere a nota ou o comentário e salve. Sua avaliação anterior será substituída."
        />
      ) : null}

      <View style={styles.section}>
        <Text variant="label" style={styles.centered}>
          Já teve aula com {firstName}?
        </Text>
        <Tabs<HadClassOption>
          options={[
            { key: 'yes', label: 'Sim, já tivemos' },
            { key: 'no', label: 'Ainda não' },
          ]}
          activeKey={hadClass ? 'yes' : 'no'}
          onChange={(key) => onChangeHadClass(key === 'yes')}
        />
        {!hadClass ? (
          <Banner
            testID="review-not-yet-banner"
            variant="warning"
            title="Avalie depois da primeira aula"
            description={`A avaliação conta como foi a aula para outras famílias. Volte aqui quando tiver aula com ${firstName}.`}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text variant="label" style={styles.centered}>
          Qual nota você dá?
        </Text>
        <Rating
          testID="review-rating"
          value={rating}
          maxStars={MAX_RATING}
          onChange={onChangeRating}
          style={styles.stars}
        />
        <Text variant="caption" color="textMuted" style={styles.centered}>
          {ratingLabel ?? 'Toque nas estrelas para avaliar'}
        </Text>
        {ratingError ? (
          <Text accessibilityRole="alert" variant="caption" color="danger" style={styles.centered}>
            {ratingError}
          </Text>
        ) : null}
      </View>

      <FormTextField
        control={control}
        name="comment"
        label="Conte como foi sua experiência"
        placeholder="O que você mais gostou? Como foi o aprendizado?"
        helperText={`Opcional • ${commentLength}/${COMMENT_MAX_LENGTH}`}
        maxLength={COMMENT_MAX_LENGTH}
        multiline
        textAlignVertical="top"
        style={styles.comment}
      />

      {errorMessage ? (
        <Text accessibilityRole="alert" color="danger">
          {errorMessage}
        </Text>
      ) : null}

      <Button
        title={isEditing ? 'Salvar avaliação' : 'Enviar avaliação'}
        disabled={!canSubmit}
        loading={isSubmitting}
        onPress={onSubmit}
      />
    </View>
  );
}

const COMMENT_MIN_HEIGHT = 120;

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
  stars: {
    alignSelf: 'center',
  },
  comment: {
    minHeight: COMMENT_MIN_HEIGHT,
    paddingVertical: spacing.sm,
  },
});
