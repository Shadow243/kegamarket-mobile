import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;

interface Messages {
  required: string;
  invalidEmail: string;
  tooShort: string;
  mismatch: string;
}

export function createProfileSchema(messages: Messages) {
  return z.object({
    name: z.string().trim().min(1, messages.required).max(255),
    email: z.string().trim().min(1, messages.required).email(messages.invalidEmail),
    phone: z.string().trim().min(1, messages.required).max(20),
  });
}

export function createPasswordSchema(messages: Messages) {
  return z
    .object({
      current_password: z.string().min(1, messages.required),
      password: z.string().min(MIN_PASSWORD_LENGTH, messages.tooShort),
      password_confirmation: z.string().min(1, messages.required),
    })
    .refine((values) => values.password === values.password_confirmation, {
      message: messages.mismatch,
      path: ['password_confirmation'],
    });
}

export type ProfileForm = z.infer<ReturnType<typeof createProfileSchema>>;
export type PasswordForm = z.infer<ReturnType<typeof createPasswordSchema>>;
