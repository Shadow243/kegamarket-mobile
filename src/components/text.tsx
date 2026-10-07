import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/utils/cn';

const variants = {
  display: 'font-heading-extrabold text-[28px] leading-[34px] tracking-tight',
  title: 'font-heading text-[22px] leading-7 tracking-tight',
  headline: 'font-heading-semibold text-[17px] leading-6',
  body: 'font-body-regular text-[15px] leading-[22px]',
  callout: 'font-body-semibold text-[15px] leading-5',
  caption: 'font-body text-[13px] leading-[18px]',
  label: 'font-body-bold text-[11px] uppercase tracking-wider',
  price: 'font-heading text-[17px] leading-6',
} as const;

const tones = {
  default: 'text-fg',
  muted: 'text-fg-muted',
  subtle: 'text-fg-subtle',
  brand: 'text-brand',
  'on-brand': 'text-on-brand',
  danger: 'text-danger-fg',
  white: 'text-white',
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
}

export function Text({ variant = 'body', tone = 'default', className, ...props }: TextProps) {
  return <RNText className={cn(variants[variant], tones[tone], className)} {...props} />;
}
