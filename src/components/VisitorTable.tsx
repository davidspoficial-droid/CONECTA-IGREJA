import React from 'react';
import { Visitante } from '../types';
import { WhatsAppButton } from './WhatsAppButton';
import { Eye, Edit2, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';

interface VisitorTableProps {
  visitantes: Visitante[];
  onViewDetails: (id: string) => void;
  onEdit: (visitante: Visitante) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: any) => Promise<void>;
}

export function getStatusStyle(status: string) {
  switch (status) {
    case 'Novo':
      return 'bg-blue-500/10 text-blue-300 border-blue-400/20';
    case 'Contato pendente':
      return 'bg-indigo-500/10 text-indigo-300 border-indigo-400/20';
    case 'Contato realizado':
      return 'bg-teal-500/10 text-teal-300 border-teal-400/20';
    case 'Em acompanhamento':
      return 'bg-purple-500/10 text-purple-300 border-purple-400/20';
    case 'Retornou à igreja':
      return 'bg-pink-500/10 text-pink-300 border-pink-400/20';
    case 'Integrado':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20';
    case 'Sem retorno':
      return 'bg-slate-500/10 text-slate-400 border-slate-400/10';
    default:
      return 'bg-slate-500/10 text-slate-300 border-white/5';
  }
}

export function VisitorTable({ 
  visitantes, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: VisitorTableProps) {
  
  const churchConfig = (() => {
    try {
      const stored = localStorage.getItem('conecta_configuracao');
      return stored ? JSON.parse(stored) : { nome: 'Conecta Igreja' };
    } catch {
      return { nome: 'Conecta Igreja' };
    }
  })();

  const handleQuickStatus = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation(); // Avoid triggering row clicks
    await onStatusChange(id, e.target.value);
  };

  if (visitantes.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4 border border-white/5 animate-pulse">
          <FileText size={20} />
        </div>
        <p className="text-slate-300 font-semibold text-sm">Nenhum visitante encontrado</p>
        <p className="text-slate-500 text-xs mt-1.5 max-w-sm px-6">
          Tente alterar seus parâmetros de filtro de busca ou cadastre novas conexões através do formulário público.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Desktop Table (md and up) */}
      <div className="hidden md:block overflow-x-auto bg-slate-900/20 border border-white/5 rounded-2xl shadow-xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 font-mono text-[10px] tracking-widest uppercase">
              <th className="py-4 px-5 font-semibold">Visitante</th>
              <th className="py-4 px-4 font-semibold">Contato</th>
              <th className="py-4 px-4 font-semibold">Local Consolidativo</th>
              <th className="py-4 px-4 font-semibold">Status</th>
              <th className="py-4 px-4 font-semibold">Data Regular</th>
              <th className="py-4 px-5 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-300">
            {visitantes.map((v) => (
              <tr 
                key={v.id} 
                onClick={() => onViewDetails(v.id)}
                className="hover:bg-white/5 transition-all duration-150 cursor-pointer group"
              >
                 {/* Nome e Idade */}
                <td className="py-4 px-5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {v.nome_completo}
                    </span>
                    <span className="text-xs text-slate-500 font-mono mt-0.5">
                      {v.idade ? `${v.idade} anos` : 'Idade N/A'} • {v.sexo || 'Não espec.'}
                    </span>
                    {v.equipe && (
                      <span className="text-[9px] bg-slate-800 text-sky-300 max-w-fit px-1.5 py-0.5 mt-1 border border-white/5 rounded font-mono">
                        {v.equipe}
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Telefone & WhatsApp Actions */}
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <WhatsAppButton 
                        telefone={v.telefone} 
                        nomeCompleto={v.nome_completo} 
                        churchName={churchConfig.nome}
                        compact={true}
                      />
                    </div>
                    {v.pastor_responsavel && (
                      <span className="text-[10px] text-slate-500 mt-1 font-medium">
                        Pr: {v.pastor_responsavel}
                      </span>
                    )}
                  </div>
                </td>

                {/* Culto & Consolidador */}
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="text-slate-300 text-xs font-semibold">{v.culto || 'Geral'}</span>
                    <span className="text-[11px] text-slate-500 mt-1 truncate max-w-[185px]" title={`Consolidador: ${v.consolidador || 'N/A'}`}>
                      {v.consolidador ? `Consolidador: ${v.consolidador}` : 'Sem consolidador'}
                    </span>
                  </div>
                </td>

                {/* Status Badges & Quick Selector */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className={`px-2.5 py-1 text-[11px] font-semibold border rounded-lg ${getStatusStyle(v.status)}`}>
                      {v.status}
                    </span>
                    
                    {/* Fast Status alteration dropdown */}
                    <select
                      value={v.status}
                      onChange={(e) => handleQuickStatus(e, v.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 bg-slate-950/80 border border-white/10 hover:border-white/20 px-1 py-0.5 rounded text-[10px] text-slate-400 cursor-pointer transition-opacity"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Contato pendente">Contato pendente</option>
                      <option value="Contato realizado">Contato realizado</option>
                      <option value="Em acompanhamento">Em acompanhamento</option>
                      <option value="Retornou à igreja">Retornou à igreja</option>
                      <option value="Integrado">Integrado</option>
                      <option value="Sem retorno">Sem retorno</option>
                    </select>
                  </div>
                </td>

                {/* DATA */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Calendar size={12} className="text-slate-600" />
                    <span>{v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onViewDetails(v.id)}
                      className="p-2 bg-slate-950/45 hover:bg-indigo-950 hover:text-indigo-300 border border-white/5 rounded-xl text-slate-400 transition-all cursor-pointer"
                      title="Ver Ficha Detalhada"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(v)}
                      className="p-2 bg-slate-950/45 hover:bg-indigo-950 hover:text-indigo-300 border border-white/5 rounded-xl text-slate-400 transition-all cursor-pointer"
                      title="Editar Informações"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza de que deseja remover o cadastro de ${v.nome_completo}?`)) {
                          onDelete(v.id);
                        }
                      }}
                      className="p-2 bg-slate-950/45 hover:bg-rose-950 hover:text-rose-400 border border-white/5 rounded-xl text-slate-400 transition-all cursor-pointer"
                      title="Excluir Visitante"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Cards List (sm and below) */}
      <div className="md:hidden flex flex-col gap-3.5">
        {visitantes.map((v) => (
          <div 
            key={v.id}
            onClick={() => onViewDetails(v.id)}
            className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 active:bg-white/5 transition-transform active:scale-99"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-white text-base tracking-tight leading-snug">
                  {v.nome_completo}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {v.idade ? `${v.idade} anos` : 'Sem idade'} • {v.sexo || 'Não espec.'} 
                </p>
              </div>

              <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-lg whitespace-nowrap ${getStatusStyle(v.status)}`}>
                {v.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-400 border-t border-b border-white/5 py-2.5">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500">Culto</span>
                <span className="font-medium text-slate-200 block truncate">{v.culto || 'Geral'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500">Consolidador</span>
                <span className="font-medium text-slate-200 block truncate">{v.consolidador || 'Não atribuído'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500">Pastor Responsável</span>
                <span className="font-medium text-slate-200 block truncate text-blue-200">{v.pastor_responsavel || 'Não atribuído'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500">Equipe</span>
                <span className="font-medium text-slate-200 block truncate text-indigo-300">{v.equipe || 'Sem equipe'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Calendar size={11} />
                {v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : '-'}
              </span>

              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <WhatsAppButton 
                  telefone={v.telefone} 
                  nomeCompleto={v.nome_completo} 
                  churchName={churchConfig.nome}
                  compact={true}
                />
                
                <button
                  onClick={() => onEdit(v)}
                  className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-slate-400 active:bg-indigo-950 active:text-indigo-300"
                >
                  <Edit2 size={13} />
                </button>

                <button
                  onClick={() => onViewDetails(v.id)}
                  className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-slate-300 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>Ficha</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
