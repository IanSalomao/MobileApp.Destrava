import { zodResolver } from '@hookform/resolvers/zod';
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, useFormState, useWatch } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { isValidTeacherId } from '@/features/teachers/public-profile/domain';
import { publicTeacherKeys } from '@/features/teachers/public-profile/hooks';

import { createReview, getMyReview, listTeacherReviews, updateReview } from './api';
import { getRatingLabel, MIN_RATING, normalizeComment } from './domain';
import { getReviewErrorMessage } from './errors';
import { reviewSchema, type ReviewInput } from './schemas';
import type { Review } from './types';

export const reviewKeys = {
  all: ['reviews'] as const,
  mine: (guardianId: string, teacherId: string) =>
    [...reviewKeys.all, 'mine', guardianId, teacherId] as const,
  teacher: (teacherId: string) => [...reviewKeys.all, 'teacher', teacherId] as const,
};

/** Só vai ao banco com um id de professor válido (as rotas provisórias usam ids de exemplo). */
function toQueryableTeacherId(teacherId: string | undefined): string | null {
  return teacherId && isValidTeacherId(teacherId) ? teacherId : null;
}

/**
 * Avaliação que o responsável logado já fez para o professor (null se ainda não avaliou). A tela
 * usa para decidir entre criar e editar: é uma avaliação por par.
 */
export function useMyReview(teacherId: string | undefined) {
  const { session } = useSession();
  const guardianId = session?.user.id;
  const validTeacherId = toQueryableTeacherId(teacherId);

  const query = useQuery({
    queryKey: reviewKeys.mine(guardianId ?? 'anonymous', validTeacherId ?? 'unknown'),
    queryFn:
      guardianId && validTeacherId ? () => getMyReview(guardianId, validTeacherId) : skipToken,
  });

  return {
    ...query,
    errorMessage: query.error ? getReviewErrorMessage(query.error) : null,
  };
}

/**
 * Lista paginada das avaliações do professor, da mais recente para a mais antiga. Pronta para a
 * tela "Ver todas as avaliações" (/reviews/[teacherId]): `reviews` junta as páginas já carregadas
 * e `fetchNextPage` traz a próxima enquanto `hasNextPage` for true.
 */
export function useTeacherReviews(teacherId: string | undefined) {
  const validTeacherId = toQueryableTeacherId(teacherId);

  const query = useInfiniteQuery({
    queryKey: reviewKeys.teacher(validTeacherId ?? 'unknown'),
    queryFn: validTeacherId
      ? ({ pageParam }) => listTeacherReviews(validTeacherId, pageParam)
      : skipToken,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  return {
    ...query,
    reviews: query.data?.pages.flatMap((page) => page.reviews) ?? [],
    errorMessage: query.error ? getReviewErrorMessage(query.error) : null,
  };
}

/**
 * ViewModel da tela "Avaliar professor" (RF12). Sem `review` cria a avaliação; com `review` edita
 * a que já existe. "Ainda não" no "Já teve aula?" bloqueia o envio. Salvar recarrega as
 * avaliações e o perfil público (nota média e total mudam) e chama `onSaved`.
 */
export function useReviewForm(teacherId: string, review: Review | null, onSaved?: () => void) {
  const queryClient = useQueryClient();
  const [hadClass, setHadClass] = useState(true);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review?.rating ?? 0, comment: review?.comment ?? '' },
  });
  const rating = useWatch({ control: form.control, name: 'rating' });
  const comment = useWatch({ control: form.control, name: 'comment' });
  const { errors } = useFormState({ control: form.control, name: 'rating' });

  const mutation = useMutation({
    mutationFn: (values: ReviewInput) => {
      const payload = { rating: values.rating, comment: normalizeComment(values.comment) };
      return review ? updateReview(review.id, payload) : createReview(teacherId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      void queryClient.invalidateQueries({ queryKey: publicTeacherKeys.detail(teacherId) });
      onSaved?.();
    },
  });

  return {
    isEditing: Boolean(review),
    control: form.control,
    rating,
    ratingLabel: getRatingLabel(rating),
    ratingError: errors.rating?.message,
    setRating: (value: number) =>
      form.setValue('rating', value, { shouldDirty: true, shouldValidate: true }),
    commentLength: comment?.length ?? 0,
    hadClass,
    setHadClass,
    canSubmit: hadClass && rating >= MIN_RATING && !mutation.isPending,
    submit: () =>
      form.handleSubmit((values) => {
        if (!hadClass) return;
        mutation.mutate(values);
      })(),
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getReviewErrorMessage(mutation.error) : null,
  };
}
