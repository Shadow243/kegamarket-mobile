import { z } from 'zod';

export function createAddressSchema(messages: { required: string; invalidEmail: string }) {
  const required = (max: number) => z.string().trim().min(1, messages.required).max(max);
  return z.object({
    recipient_name: required(150),
    recipient_phone: required(30),
    recipient_email: z.string().trim().min(1, messages.required).email(messages.invalidEmail),
    delivery_city: required(120),
    delivery_commune: z.string().trim().max(120),
    delivery_address_line: required(255),
  });
}

export type AddressForm = z.infer<ReturnType<typeof createAddressSchema>>;
