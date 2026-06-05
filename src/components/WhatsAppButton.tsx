import React, { useState } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { gerarLinkWhatsApp, limparTelefone } from '../utils/mask';

interface WhatsAppButtonProps {
  telefone: string;
  nomeCompleto: string;
  churchName?: string;
  compact?: boolean;
}

export function WhatsAppButton({ telefone, nomeCompleto, churchName, compact = false }: WhatsAppButtonProps) {
  const [copied, setCopied] = useState(false);
  const rawNumber = limparTelefone(telefone);
  const isValid = rawNumber.length >= 8;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row clicks
    if (!isValid) return;
    try {
      await navigator.clipboard.writeText(telefone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar telefone:', err);
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row clicks
    if (!isValid) return;
    const link = gerarLinkWhatsApp(telefone, nomeCompleto, churchName || 'Conecta Igreja');
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (!isValid) {
    return (
      <div className="flex items-center gap-1.5 opacity-40 cursor-not-allowed">
        <span className="text-xs text-slate-500 font-mono">Sem telefone</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {/* WhatsApp Icon Trigger */}
        <button
          onClick={handleWhatsAppClick}
          title="Enviar mensagem no WhatsApp"
          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
        >
          <MessageCircle size={14} />
        </button>

        {/* Copy Phone Trig */}
        <button
          onClick={handleCopy}
          title="Copiar telefone"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          {copied ? <Check size={14} className="text-emerald-400 animate-scale-up" /> : <Copy size={14} />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Dynamic CTA button */}
      <button
        onClick={handleWhatsAppClick}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer"
      >
        <MessageCircle size={14} />
        <span>Abrir WhatsApp</span>
      </button>

      {/* Copy Trigger */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        title="Copiar Telefone para área de transferência"
      >
        {copied ? (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs px-1">
            <Check size={14} className="animate-scale-up" />
            <span>Copiado</span>
          </div>
        ) : (
          <Copy size={14} />
        )}
      </button>
    </div>
  );
}
