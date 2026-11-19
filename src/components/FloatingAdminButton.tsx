/* Tombol mengambang di sudut kanan bawah untuk menghubungi admin Dapoer AMI via WhatsApp (FT-12) */
import {MessageCircle} from 'lucide-react';
import {buildAdminWhatsAppUrl} from '../lib/calculator.ts';
import type {CategoryId} from '../types.ts';

interface FloatingAdminButtonProps {
  activeCategoryId: CategoryId;
}

export function FloatingAdminButton({activeCategoryId}: FloatingAdminButtonProps) {
  const href = buildAdminWhatsAppUrl(activeCategoryId);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi Admin Dapoer AMI via WhatsApp"
      className="fixed bottom-20 right-4 z-30 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] transition-colors duration-150 ease-out hover:bg-neutral-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 lg:bottom-6 lg:right-6"
    >
      <MessageCircle className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
      <span>Hubungi Admin</span>
    </a>
  );
}
