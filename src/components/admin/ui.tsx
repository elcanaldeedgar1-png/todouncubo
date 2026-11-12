'use client';
import { startTransition, type FormEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * React 19 vacía los formularios tras ejecutar una acción. En formularios largos
 * (semillas, artículos) eso borraría lo escrito si hay un error, así que enviamos a mano.
 */
export function useNoResetSubmit(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
}

export function PendingButton({ pending, children, className }: { pending: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={cn('btn-gold disabled:opacity-60', className)}>
      {pending ? 'Guardando…' : children}
    </button>
  );
}

export function SubmitButton({ children, className, pendingText = 'Guardando…' }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn('btn-gold disabled:opacity-60', className)}>
      {pending ? pendingText : children}
    </button>
  );
}

/** Botón de envío que pide confirmación antes de una acción destructiva. */
export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn('btn-danger', className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? 'Eliminando…' : children}
    </button>
  );
}

export function Alert({ kind = 'ok', children }: { kind?: 'ok' | 'error'; children: React.ReactNode }) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        kind === 'error' ? 'border-redstone/50 bg-redstone/10 text-[#ffb1aa]' : 'border-grass/50 bg-grass/10 text-[#b9eb98]',
      )}
    >
      {children}
    </div>
  );
}
