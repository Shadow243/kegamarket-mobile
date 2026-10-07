import { z } from 'zod';

import { MIN_PASSWORD_LENGTH } from '@/screens/settings/schemas';

interface Messages {
  required: string;
  invalidEmail: string;
  tooShort: string;
  mismatch: string;
  mustAcceptTerms: string;
}

export function createRegisterSchema(messages: Messages) {
  return z
    .object({
      account_type: z.enum(['particulier', 'professionnel']),
      name: z.string().trim().min(1, messages.required).max(255),
      phone: z.string().trim().min(1, messages.required).max(20),
      email: z.string().trim().min(1, messages.required).email(messages.invalidEmail),
      password: z.string().min(MIN_PASSWORD_LENGTH, messages.tooShort),
      password_confirmation: z.string().min(1, messages.required),
      terms_accepted: z.boolean().refine((value) => value, messages.mustAcceptTerms),
    })
    .refine((values) => values.password === values.password_confirmation, {
      message: messages.mismatch,
      path: ['password_confirmation'],
    });
}

export function createForgotPasswordSchema(messages: Pick<Messages, 'required' | 'invalidEmail'>) {
  return z.object({
    email: z.string().trim().min(1, messages.required).email(messages.invalidEmail),
  });
}

export type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;
export type ForgotPasswordForm = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
