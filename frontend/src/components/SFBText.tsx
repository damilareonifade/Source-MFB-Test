'use client';

import { cn } from '@/lib/utils';

type SFBTextSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'label' | 'small';
type SFBTextColor = 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'muted' | 'default' | 'white' | 'inherit';

interface SFBTextProps {
  size: SFBTextSize;
  text: string;
  color?: SFBTextColor;
  className?: string;
  link?: boolean;
  linkValue?: string;
  linkHref?: string;
  handleClick?: () => void;
  fontFamily?: 'sans' | 'display';
}

const sizeMap: Record<SFBTextSize, string> = {
  h1: 'text-3xl font-bold leading-tight',
  h2: 'text-2xl font-semibold leading-snug',
  h3: 'text-xl font-semibold leading-snug',
  h4: 'text-lg font-semibold',
  h5: 'text-base font-semibold',
  p: 'text-[0.9375rem] leading-relaxed',
  span: 'text-[0.9375rem]',
  label: 'text-sm font-medium',
  small: 'text-xs',
};

const colorMap: Record<SFBTextColor, string> = {
  primary: 'text-primary',
  secondary: 'text-primary-300',
  accent: 'text-accent-600',
  danger: 'text-danger',
  success: 'text-success',
  muted: 'text-[color:var(--color-text-muted)]',
  default: 'text-[color:var(--color-text)]',
  white: 'text-white',
  inherit: '',
};

const tagMap: Record<SFBTextSize, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  p: 'p',
  span: 'span',
  label: 'label',
  small: 'small',
};

export default function SFBText({
  size,
  text,
  color = 'default',
  className,
  link,
  linkValue,
  linkHref,
  handleClick,
  fontFamily = 'sans',
}: SFBTextProps) {
  const Tag = tagMap[size];
  const classes = cn(
    sizeMap[size],
    colorMap[color],
    fontFamily === 'display' && 'font-display',
    handleClick && 'cursor-pointer hover:opacity-80 transition-opacity',
    className
  );

  return (
    <Tag className={classes} onClick={handleClick}>
      {text}
      {link && linkHref && (
        <a
          href={linkHref}
          className="ml-1 text-accent-600 hover:text-accent-700 underline underline-offset-2 transition-colors"
        >
          {linkValue}
        </a>
      )}
    </Tag>
  );
}
