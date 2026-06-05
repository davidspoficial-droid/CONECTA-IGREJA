import React, { useState, useEffect } from 'react';
import { useRouter } from '../../utils/router';
import { AdminLayout } from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Visitante, Acompanhamento } from '../../types';
import { getStatusStyle } from '../../components/VisitorTable';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { VisitorForm } from '../../components/VisitorForm';
import { 
  ArrowLeft, 
  Calendar, 
  Edit2, 
  Trash2, 
  User, 
  MessageSquare,
  History,
  Activity,
  UserCheck2,
  Clock,
  Send,
  Loader2,
  X,
  MapPin,
  Flame,
  Award,
  FileText
} from 'lucide-react';

export function VisitanteDetalhes() {
  const { params, navigate } = useRouter();
  const visitorId = params.id;

  const [loading, setLoading] = useState(true);
  const [visitor, setVisitor] = useState<Visitante | null>(null);
  const [acompanhamentos, setAcompanhamentos] = useState<Acompanhamento[]>([]);

  // Follow-up Register Form states
  const [observacao, setObservacao] = useState('');
  const [novoStatus, setNovoStatus] = useState('');
  const [submittingHist, setSubmittingHist] = useState(false);

  // Edit Modal controls
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editIsLoading, setEditIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadVisitorRecord = async () => {
    if (!visitorId) return;
    setLoading(true);
    try {
      // 1. Fetch visitor core profile
      const { data: visData, error: visErr } = await supabase
        .from('visitantes')
        .select('*')
        .eq('id', visitorId);

      if (visErr) throw visErr;

      if (!visData || visData.length === 0) {
        setVisitor(null);
      } else {
        const currentVis = visData[0];
        setVisitor(currentVis);
        setNovoStatus(currentVis.status); // Default next status to current
      }

      // 2. Fetch historic follow-up logs
      const { data: histData, error: histErr } = await supabase
        .from('acompanhamentos')
        .select('*')
        .eq('visitante_id', visitorId)
        .order('created_at', { ascending: false });

      if (histErr) throw histErr;
      setAcompanhamentos(histData || []);

    } catch (err) {
      console.error('Erro ao buscar ficha do visitante:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitorRecord();
  }, [visitorId]);

  // Handle follow up submission
  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitor || !observacao.trim()) return;

    setSubmittingHist(true);
    try {
      // 1. Write the new log item in acompanhamentos
      const { error: insertErr } = await supabase
        .from('acompanhamentos')
        .insert([{
          visitante_id: visitor.id,
          observacao: observacao.trim(),
          status: novoStatus
        }]);

      if (insertErr) throw insertErr;

      // 2. Modify visitor status if it changed
      const { error: updateErr } = await supabase
        .from('visitantes')
        .update({ status: novoStatus })
        .eq('id', visitor.id);

      if (updateErr) throw updateErr;

      // Reset form & reload record values
      setObservacao('');
      await loadVisitorRecord();

    } catch (err) {
      console.error('Falha ao registrar acompanhamento:', err);
      alert('Não foi possível salvar o acompanhamento no momento.');
    } finally {
      setSubmittingHist(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!visitor) return;
    if (confirm(`Tem certeza absoluta de que deseja excluir permanentemente a ficha de ${visitor.nome_completo}?`)) {
      try {
        const { error } = await supabase.from('visitantes').delete().eq('id', visitor.id);
        if (error) throw error;
        navigate('/admin/visitantes');
      } catch (err) {
        console.error('Erro ao deletar registro:', err);
        alert('Não foi possível excluir o cadastro.');
      }
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!visitor) return;
    setEditIsLoading(true);
    setFeedbackMsg(null);
    try {
      const { error } = await supabase
        .from('visitantes')
        .update(formData)
        .eq('id', visitor.id);

      if (error) throw error;

      setFeedbackMsg({ type: 'ok', text: 'Dados atualizados!' });
      
      // Update local state directly
      setVisitor({ ...visitor, ...formData });

      // Add record to timeline if status modified
      if (formData.status !== visitor.status) {
        await supabase.from('acompanhamentos').insert([{
          visitante_id: visitor.id,
          observacao: `Dados gerais modificados. Status alterado para "${formData.status}".`,
          status: formData.status
        }]);
      }

      setTimeout(() => {
        setIsEditOpen(false);
        setFeedbackMsg(null);
        loadVisitorRecord();
      }, 800);

    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Falha ao atualizar dados.' });
    } finally {
      setEditIsLoading(false);
    }
  };

  const getStatusFriendlyDesc = (status: string) => {
    switch (status) {
      case 'Novo':
        return 'Entrou no sistema agora de primeira vez. Necessário avaliar consolidador.';
      case 'Contato pendente':
        return 'Pessoa de acolhida inicial ainda não respondeu, ou contato agendado.';
      case 'Contato realizado':
        return 'Consolidador fez o primeiro contato inicial telefônico ou WhatsApp.';
      case 'Em acompanhamento':
        return 'Em fase de orações regulares, aconselhamento pastoral ou visitas em casa.';
      case 'Retornou à igreja':
        return 'Visitou novos cultos adicionais ou participou de eventos de jovens/rede.';
      case 'Integrado':
        return 'Consolidado com sucesso! Já frequenta pequenos grupos ou serve em equipe.';
      case 'Sem retorno':
        return 'Contatos repetidos sem atendimento ou informou que não deseja contatos por hora.';
      default:
        return 'Acompanhamento regular do visitante.';
    }
  };

  return (
    <AdminLayout activeTab="visitantes">
      <div className="space-y-6">
        
        {/* Navigation back and header controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <button
            onClick={() => navigate('/admin/visitantes')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Voltar ao Gerenciamento Geral</span>
          </button>

          {visitor && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white/5 border border-white/5 hover:border-blue-500/20 rounded-xl text-slate-300 hover:text-white cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Editar Ficha</span>
              </button>

              <button
                onClick={handleDeleteRecord}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-950/25 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-900/35 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Excluir Ficha</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center bg-slate-900/10 border border-white/5 rounded-3xl">
            <Loader2 className="animate-spin text-blue-500 mb-3" size={28} />
            <p className="text-xs font-mono text-indigo-300 tracking-widest uppercase">Localizando ficha cadastral...</p>
          </div>
        ) : !visitor ? (
          <div className="text-center py-20 bg-slate-930/40 rounded-3xl border border-white/5">
            <X size={36} className="text-rose-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-white">Visitante Não Encontrado</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto">O registro de visitante solicitado pode ter sido excluído permanentemente do banco Supabase.</p>
          </div>
        ) : (
          /* Profile Work grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profile column left */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Card Header */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-indigo-500/10">
                    {visitor.nome_completo.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {visitor.nome_completo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{visitor.idade ? `${visitor.idade} anos` : 'Idade omitida'}</span>
                      <span className="text-slate-600">•</span>
                      <span>{visitor.sexo || 'Outro'}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-blue-400/90 font-medium">Lançado em: {visitor.created_at ? new Date(visitor.created_at).toLocaleDateString('pt-BR') : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Subtitle fields layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 border-t border-white/5 pt-6 mt-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Culto de Entrada</span>
                    <p className="text-sm text-slate-200 font-semibold mt-1">{visitor.culto || 'Geral'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Equipe Designada</span>
                    <p className="text-sm text-slate-200 font-semibold mt-1">{visitor.equipe || 'Nenhuma'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Acolhedor de Portaria</span>
                    <p className="text-sm text-slate-200 font-semibold mt-1">{visitor.consolidador || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Pastor do Visitante</span>
                    <p className="text-sm text-indigo-300 font-medium mt-1">{visitor.pastor_responsavel || 'Não designado'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Ações de Contato Prontas</span>
                    <div className="mt-1.5">
                      <WhatsAppButton telefone={visitor.telefone} nomeCompleto={visitor.nome_completo} />
                    </div>
                  </div>
                </div>

                {/* Prayer prompt display if exists */}
                {visitor.pedido_oracao && (
                  <div className="bg-slate-950/40 border border-blue-500/10 rounded-2xl p-4 mt-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 flex items-center gap-1">
                      <Flame size={12} className="text-blue-500" />
                      <span>Pedido de Acolhimento e Oração</span>
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 italic mt-2 leading-relaxed">
                      "{visitor.pedido_oracao}"
                    </p>
                  </div>
                )}

                {/* General Observation display if exists */}
                {visitor.observacao && (
                  <div className="bg-slate-950/40 border border-blue-500/10 rounded-2xl p-4 mt-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 flex items-center gap-1">
                      <FileText size={12} className="text-blue-500" />
                      <span>Observações da Consolidação</span>
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {visitor.observacao}
                    </p>
                  </div>
                )}
              </div>

              {/* REGISTER FOLLOW UP CARD */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-2.5 mb-5 border-b border-white/5 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <UserCheck2 size={16} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 tracking-wide uppercase">Dossiê e Registro de Acompanhamento</h4>
                </div>

                <form onSubmit={handleAddFollowup} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Select new status */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Novo Status</label>
                      <select
                        value={novoStatus}
                        onChange={(e) => setNovoStatus(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
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

                    {/* Observação */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrever Atividade Realizada (Visita, fone, etc.)</label>
                      <input
                        type="text"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        placeholder="Ex: Liguei hoje e conversamos por 10 min. Ele quer participar do grupo de casados."
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingHist || !observacao.trim()}
                    id="btn-save-followup"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-bold hover:from-indigo-600 hover:to-purple-700 text-white disabled:opacity-40 select-none cursor-pointer"
                  >
                    {submittingHist ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={14} />
                        <span>Sincronizando log...</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Salvar Acompanhamento</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* Profile right log timeline block */}
            <div className="space-y-6">
              
              {/* Current Status Overview */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-md text-center">
                <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2">Status de Acolhida Atual</span>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(visitor.status)}`}>
                  {visitor.status}
                </span>
                <p className="text-[11px] text-slate-400 mt-3 px-2 italic text-center">
                  "{getStatusFriendlyDesc(visitor.status)}"
                </p>
              </div>

              {/* TIMELINE HISTORIC */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-md flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                  <History size={16} className="text-blue-400" />
                  <h4 className="text-xs font-bold text-slate-200 tracking-wide uppercase font-mono">Linha do Tempo de Retorno</h4>
                </div>

                {/* List items */}
                <div className="relative border-l border-white/5 pl-4 ml-2.5 py-2 space-y-5 flex-1 max-h-[360px] overflow-y-auto">
                  
                  {acompanhamentos.map((ac, idx) => (
                    <div key={ac.id || idx} className="relative group text-left">
                      {/* Custom bubble indicator */}
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-500 group-hover:bg-blue-450 group-hover:border-blue-300 transition-colors"></span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold border rounded ${getStatusStyle(ac.status)} scale-90 -ml-1`}>
                            {ac.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {ac.data_acompanhamento ? new Date(ac.data_acompanhamento).toLocaleDateString('pt-BR') : '-'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                          {ac.observacao}
                        </p>
                      </div>
                    </div>
                  ))}

                  {acompanhamentos.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      <Clock size={20} className="mx-auto text-slate-700 mb-2 animate-pulse" />
                      <span>Sem histórico registrado. Faça o primeiro contato no formulário acima!</span>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        )}

        {/* MODAL: Edit Visitor Info inside detail Sheet */}
        {isEditOpen && visitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Editar Dados de Consolidação</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Modifique os registros do visitante {visitor.nome_completo}</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditOpen(false);
                  }}
                  className="p-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <VisitorForm 
                  initialData={visitor} 
                  onSubmit={handleEditSubmit} 
                  isLoading={editIsLoading} 
                  buttonText="Salvar Informações"
                  successMessage={feedbackMsg?.type === 'ok' ? feedbackMsg.text : null}
                  errorMessage={feedbackMsg?.type === 'err' ? feedbackMsg.text : null}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
