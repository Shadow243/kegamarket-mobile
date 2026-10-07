import { z } from 'zod';

export function createLoginSchema(requiredMessage: string) {
  return z.object({
    login: z.string().trim().min(1, requiredMessage),
    password: z.string().min(1, requiredMessage),
  });
}

export type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>;
