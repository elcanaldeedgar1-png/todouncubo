'use client';
import { useState } from 'react';
import { HiCheck, HiOutlineClipboardDocument } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

export default function CopyButton({
  value,
  label = 'Copiar semilla',
  className,
  variant = 'gold',
}: {
  value: string;
  label?: string;
  className?: string;
  variant?: 'gold' | 'stone';
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Respaldo para navegadores sin API de portapapeles
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className={cn(variant === 'gold' ? 'btn-gold' : 'btn-stone', className)} aria-live="polite">
      {copied ? <HiCheck className="h-4 w-4" /> : <HiOutlineClipboardDocument className="h-4 w-4" />}
      {copied ? '¡Copiada!' : label}
    </button>
  );
}
