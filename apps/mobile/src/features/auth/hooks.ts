import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import type { UserRole } from '@/features/profile/types';

import { defaultAuthRepository, signOut, signUp, type AuthRepository } from './api';
import { getAuthErrorMessage } from './errors';
import { PASSWORD_RESET_CONFIRMATION } from './password-reset';
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  type ForgotPasswordInput,
  type SignInInput,
  type SignUpInput,
} from './schemas';

// ViewModels das telas de auth: juntam formulário, validação e chamada à API.
// A tela só renderiza o que vem daqui. Ao logar, o SessionProvider recebe a sessão
// e o Stack.Protected do layout raiz tira o usuário do fluxo de auth.

export function useSignInForm(repository: AuthRepository = defaultAuthRepository) {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: SignInInput) => repository.signIn(values),
  });

  return {
    control: form.control,
    submit: () => form.handleSubmit((values) => mutation.mutate(values))(),
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getAuthErrorMessage(mutation.error) : null,
  };
}

export function useForgotPasswordForm(repository: AuthRepository = defaultAuthRepository) {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordInput) => repository.requestPasswordReset(values),
  });

  return {
    control: form.control,
    submit: () => form.handleSubmit((values) => mutation.mutate(values))(),
    isSubmitting: mutation.isPending,
    // Mesmo texto para qualquer e-mail aceito (sem vazar se a conta existe).
    confirmationMessage: mutation.isSuccess ? PASSWORD_RESET_CONFIRMATION : null,
    // Só falhas do envio em si (rede, limite de pedidos); não dependem de a conta existir.
    errorMessage: mutation.error ? getAuthErrorMessage(mutation.error) : null,
  };
}

export function useSignUpForm(
  initialRole?: UserRole,
  // Chamado quando o cadastro criou a sessão (confirmação de e-mail desligada): a tela leva o
  // usuário ao onboarding do papel antes que a guarda de rotas o tire do fluxo de auth.
  onSignedIn?: (role: UserRole) => void,
) {
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: initialRole,
      termsAccepted: false,
      minorDataConsent: false,
    },
  });
  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: (data, variables) => {
      if (data.session) onSignedIn?.(variables.role);
    },
  });

  return {
    control: form.control,
    submit: () => form.handleSubmit((values) => mutation.mutate(values))(),
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getAuthErrorMessage(mutation.error) : null,
    // Sem sessão após o cadastro = o projeto exige confirmação por e-mail.
    needsEmailConfirmation: mutation.isSuccess && !mutation.data.session,
  };
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    // Limpa o cache para que dados de um usuário não apareçam para o próximo.
    onSuccess: () => queryClient.clear(),
  });
}
