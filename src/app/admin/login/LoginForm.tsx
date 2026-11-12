'use client';
import { useActionState } from 'react';
import { login } from '../actions';
import { Alert, SubmitButton } from '@/components/admin/ui';

export default function LoginForm({ next, configured, notAdmin }: { next?: string; configured: boolean; notAdmin?: boolean }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      {!configured && <Alert kind="error">Supabase no está configurado. Sigue los pasos del README para activar el panel.</Alert>}
      {notAdmin && configured && (
        <Alert kind="error">
          Tu cuenta no tiene permisos de administrador. Entra con otra cuenta o añádela a la tabla <code>admins</code>.
        </Alert>
      )}
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="next" value={next ?? ''} />
      <div>
        <label htmlFor="email" className="label">Correo</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <SubmitButton className="w-full !py-3" pendingText="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
