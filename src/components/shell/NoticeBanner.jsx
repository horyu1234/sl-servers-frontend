import React, { useContext } from 'react';
import { NoticeContext } from '../notice/NoticeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/cn';

const VARIANT_BY_LEGACY_CLASS = {
  primary:   'border-primary/40 text-foreground',
  success:   'border-primary/40 text-foreground',
  info:      'border-blue-500/40 text-foreground',
  warning:   'border-warning/40 text-foreground',
  danger:    'border-destructive/40 text-foreground',
  secondary: 'border-border text-foreground',
};

export default function NoticeBanner() {
  const notice = useContext(NoticeContext);
  if (!notice) return null;

  const [legacyClass, ...rest] = notice.split(',');
  const message = rest.join(',');
  const variantClass = VARIANT_BY_LEGACY_CLASS[legacyClass] ?? VARIANT_BY_LEGACY_CLASS.secondary;

  return (
    <Alert className={cn('rounded-none border-x-0 border-t-0', variantClass)}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
