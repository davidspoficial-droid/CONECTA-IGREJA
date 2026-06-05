import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { VisitorTable } from '../../components/VisitorTable';
import { VisitorForm } from '../../components/VisitorForm';
import { supabase } from '../../lib/supabase';
import { Visitante } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  HelpCircle, 
  X,
  Sparkles,
  Award
} from 'lucide-react';

export function Visitantes() {
  const [loading, setLoading] = useState(true);
  const [allVisitantes, setAllVisitantes] = useState<Visitante[]>([]);
  const [filteredVisitantes, setFilteredVisitantes] = useState<Visitante[]>([]);

  // Filter params
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cultoFilter, setCultoFilter] = useState('');
  const [equipeFilter, setEquipeFilter] = useState('');
  const [pastorFilter, setPastorFilter] = useState('');
  const [sexoFilter, setSexoFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');

  // Dropdown states dynamically populated
  const [equipes, setEquipes] = useState<string[]>([]);
  const [cultos, setCultos] = useState<string[]>([]);
  const [pastores, setPastores] = useState<string[]>([]);

  // Modal / Editing states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitante | null>(null);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Load visitors & config lists from Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visitantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllVisitantes(data || []);

      // Extract unique lists dynamically for filters
      const eqSet = new Set<string>();
      const cuSet = new Set<string>();
      const paSet = new Set<string>();

      (data || []).forEach((v: Visitante) => {
        if (v.equipe) eqSet.add(v.equipe);
        if (v.culto) cuSet.add(v.culto);
        if (v.pastor_responsavel) paSet.add(v.pastor_responsavel);
      });

      setEquipes(Array.from(eqSet));
      setCultos(Array.from(cuSet));
      setPastores(Array.from(paSet));

    } catch (err) {
      console.error('Falha ao ler dados dos visitantes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort logic whenever params change
  useEffect(() => {
    let result = [...allVisitantes];

    // 1. Search term (Nome completo, telefone, consolidador)
    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.nome_completo.toLowerCase().includes(q) || 
        v.telefone.includes(q) || 
        (v.consolidador && v.consolidador.toLowerCase().includes(q))
      );
    }

    // 2. Status
    if (statusFilter !== '') {
      result = result.filter(v => v.status === statusFilter);
    }

    // 3. Culto
    if (cultoFilter !== '') {
      result = result.filter(v => v.culto === cultoFilter);
    }

    // 4. Equipe
    if (equipeFilter !== '') {
      result = result.filter(v => v.equipe === equipeFilter);
    }

    // 5. Pastor Responsavel
    if (pastorFilter !== '') {
      result = result.filter(v => v.pastor_responsavel === pastorFilter);
    }

    // 6. Sexo
    if (sexoFilter !== '') {
      result = result.filter(v => v.sexo === sexoFilter);
    }

    // 7. Date range (Data Inicial)
    if (startDateFilter !== '') {
      const startDateTime = new Date(startDateFilter).getTime();
      result = result.filter(v => v.created_at && new Date(v.created_at).getTime() >= startDateTime);
    }

    // 8. Date range (Data Final)
    if (endDateFilter !== '') {
      // Add 23h 59m 59s to include the whole selected final day
      const endDateTime = new Date(endDateFilter).getTime() + (24 * 60 * 60 * 1000 - 1);
      result = result.filter(v => v.created_at && new Date(v.created_at).getTime() <= endDateTime);
    }

    // 9. Sorting
    if (sortBy === 'created_at_desc') {
      result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else if (sortBy === 'created_at_asc') {
      result.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    } else if (sortBy === 'nome_asc') {
      result.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
    } else if (sortBy === 'status_asc') {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    setFilteredVisitantes(result);
  }, [
    searchTerm, 
    statusFilter, 
    cultoFilter, 
    equipeFilter, 
    pastorFilter, 
    sexoFilter, 
    startDateFilter, 
    endDateFilter, 
    sortBy, 
    allVisitantes
  ]);

  // Quick Inline Status Update handler
  const handleQuickStatusChange = async (id: string, newStatus: any) => {
    try {
      const { error } = await supabase
        .from('visitantes')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update locally
      setAllVisitantes(prev => 
        prev.map(v => v.id === id ? { ...v, status: newStatus, updated_at: new Date().toISOString() } : v)
      );

      // Register acompanhamento entry automatically to preserve history!
      await supabase.from('acompanhamentos').insert([{
        visitante_id: id,
        observacao: `Status alterado de forma rápida para "${newStatus}" na listagem administrativa.`,
        status: newStatus
      }]);

    } catch (err) {
      console.error('Erro na atualização rápida de status:', err);
      alert('Não foi possível atualizar o status do visitante.');
    }
  };

  // Delete Action Handler
  const handleDeleteVisitor = async (id: string) => {
    try {
      const { error } = await supabase.from('visitantes').delete().eq('id', id);
      if (error) throw error;
      setAllVisitantes(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Falha ao excluir visitante:', err);
      alert('Houve um erro ao excluir o visitante.');
    }
  };

  // Create Submit Handler
  const handleCreateSubmit = async (formData: any) => {
    setFormIsLoading(true);
    setFeedbackMsg(null);
    try {
      const { data, error } = await supabase
        .from('visitantes')
        .insert([formData]);

      if (error) throw error;

      setFeedbackMsg({ type: 'success', text: 'Visitante criado com sucesso!' });
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setFeedbackMsg(null);
        loadData();
      }, 1000);

    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Falha ao salvar cadastro.' });
    } finally {
      setFormIsLoading(false);
    }
  };

  // Edit Submission Handler
  const handleEditSubmit = async (formData: any) => {
    if (!editingVisitor) return;
    setFormIsLoading(true);
    setFeedbackMsg(null);
    try {
      const { error } = await supabase
        .from('visitantes')
        .update(formData)
        .eq('id', editingVisitor.id);

      if (error) throw error;

      setFeedbackMsg({ type: 'success', text: 'Informações atualizadas com sucesso!' });
      
      // Update locally to avoid full API reload
      setAllVisitantes(prev => 
        prev.map(v => v.id === editingVisitor.id ? { ...v, ...formData, updated_at: new Date().toISOString() } : v)
      );

      // Log status adjustment history if status changed
      if (formData.status !== editingVisitor.status) {
        await supabase.from('acompanhamentos').insert([{
          visitante_id: editingVisitor.id,
          observacao: `Dados editados. Status atualizado para "${formData.status}".`,
          status: formData.status
        }]);
      }

      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditingVisitor(null);
        setFeedbackMsg(null);
      }, 1000);

    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao gravar atualizações.' });
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleOpenEdit = (v: Visitante) => {
    setEditingVisitor(v);
    setIsEditModalOpen(true);
  };

  const handleOpenDetails = (id: string) => {
    const { navigate } = window as any;
    window.history.pushState(null, '', `/admin/visitantes/${id}`);
    // Dispatch natural trigger
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <AdminLayout activeTab="visitantes">
      <div className="space-y-6">
        
        {/* Toolbar level 1: Title, Sync and Create Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold tracking-widest block mb-1">
              RELATÓRIO NOMINAL COMPLETO
            </span>
            <p className="text-xs text-slate-500 font-medium">
              Acompanhe, edite e gerencie o progresso de consolidação de cada visitante.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              title="Sincronizar dados"
              className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              id="btn-create-visitor"
              className="flex items-center gap-2 px-4 py-3 text-xs uppercase font-bold bg-gradient-to-r from-blue-600 to-sky-450 hover:from-blue-700 hover:to-sky-550 text-white rounded-xl shadow-lg shadow-blue-500/15 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Novo Visitante</span>
            </button>
          </div>
        </div>

        {/* Toolbar level 2: Dynamic Filters Drawer */}
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Filter size={14} />
              <span className="uppercase font-mono tracking-widest">Painel de Pesquisa Avançada & Ordenação</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* 1. Global Search term */}
            <div className="relative">
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Busca Textual</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, telefone, consolidador..."
                  className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" style={{ background: 'none', border: 'none' }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Status Filter */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Status de Consolidação</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">Todos os status</option>
                <option value="Novo">Novo</option>
                <option value="Contato pendente">Contato pendente</option>
                <option value="Contato realizado">Contato realizado</option>
                <option value="Em acompanhamento">Em acompanhamento</option>
                <option value="Retornou à igreja">Retornou à igreja</option>
                <option value="Integrado">Integrado</option>
                <option value="Sem retorno">Sem retorno</option>
              </select>
            </div>

            {/* 3. Culto/Cultos options filter */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Cultos</label>
              <select
                value={cultoFilter}
                onChange={(e) => setCultoFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">Todos os Cultos</option>
                {cultos.map(c => <option key={c} value={c}>{c}</option>)}
                {cultos.length === 0 && (
                  <>
                    <option value="Sábado 19h">Sábado 19h</option>
                    <option value="Terça-feira 19h30">Terça-feira 19h30</option>
                    <option value="Domingo 10h">Domingo 10h</option>
                    <option value="Domingo 17h">Domingo 17h</option>
                    <option value="Domingo 19h">Domingo 19h</option>
                  </>
                )}
              </select>
            </div>

            {/* 4. Equipes options filter */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Equipe de Célula/Rede</label>
              <select
                value={equipeFilter}
                onChange={(e) => setEquipeFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">Todas as Equipes</option>
                {equipes.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                {equipes.length === 0 && (
                  <>
                    <option value="Equipe da Esperança">Equipe da Esperança</option>
                    <option value="Equipe da Fé">Equipe da Fé</option>
                    <option value="Equipe de Jovens">Equipe de Jovens</option>
                    <option value="Equipe Restaurar">Equipe Restaurar</option>
                  </>
                )}
              </select>
            </div>

            {/* 5. Pastor Responsavel filter */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Pastor Responsável</label>
              <select
                value={pastorFilter}
                onChange={(e) => setPastorFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">Todos os Pastores</option>
                {pastores.map(pa => <option key={pa} value={pa}>{pa}</option>)}
                {pastores.length === 0 && (
                  <>
                    <option value="Pastor André Ramos">Pastor André Ramos</option>
                    <option value="Pastora Camila Silva">Pastora Camila Silva</option>
                    <option value="Pastor Marcus Vinícius">Pastor Marcus Vinícius</option>
                    <option value="Pastor Roberto Santos">Pastor Roberto Santos</option>
                  </>
                )}
              </select>
            </div>

            {/* 6. Sexo Filter */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Gênero / Sexo</label>
              <select
                value={sexoFilter}
                onChange={(e) => setSexoFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">Todos os sexos</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* 7. Date Filter: Data Inicial */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Ficha de: (Data Inicial)</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* 8. Date Filter: Data Final */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Até: (Data Final)</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* 9. Sorting selector */}
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Critério de Ordenação dos Resultados</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer flex-1"
                >
                  <option value="created_at_desc">Fichas mais recentes primeiro (Padrão)</option>
                  <option value="created_at_asc">Fichas mais antigas primeiro</option>
                  <option value="nome_asc">Nome em ordem alfabética (A-Z)</option>
                  <option value="status_asc">Por status de consolidação</option>
                </select>
              </div>
            </div>

          </div>

          {/* Quick Stats overview of filters */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span>Fichas correspondentes: <strong className="text-blue-300 font-bold">{filteredVisitantes.length}</strong> de <strong className="text-slate-500">{allVisitantes.length}</strong> cadastradas</span>
            </div>
            { (searchTerm || statusFilter || cultoFilter || equipeFilter || pastorFilter || sexoFilter || startDateFilter || endDateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCultoFilter('');
                  setEquipeFilter('');
                  setPastorFilter('');
                  setSexoFilter('');
                  setStartDateFilter('');
                  setEndDateFilter('');
                  setSortBy('created_at_desc');
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg"
              >
                <X size={10} />
                <span>Limpar Todos os Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Render Table List with loading protection */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center bg-slate-900/15 border border-white/5 rounded-3xl">
            <RefreshCw size={28} className="animate-spin text-blue-500 mb-3" />
            <p className="text-xs font-mono text-indigo-300 tracking-widest uppercase">Pesquisando cadastro no banco...</p>
          </div>
        ) : (
          <VisitorTable 
            visitantes={filteredVisitantes} 
            onViewDetails={handleOpenDetails} 
            onEdit={handleOpenEdit} 
            onDelete={handleDeleteVisitor} 
            onStatusChange={handleQuickStatusChange} 
          />
        )}

        {/* MODAL: Edit Visitor Info */}
        {isEditModalOpen && editingVisitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Editar Dados de Consolidação</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Modifique os registros do visitante {editingVisitor.nome_completo}</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingVisitor(null);
                  }}
                  className="p-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <VisitorForm 
                  initialData={editingVisitor} 
                  onSubmit={handleEditSubmit} 
                  isLoading={formIsLoading} 
                  buttonText="Gravar Atualizações"
                  successMessage={feedbackMsg?.type === 'success' ? feedbackMsg.text : null}
                  errorMessage={feedbackMsg?.type === 'err' ? feedbackMsg.text : null}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Create Visitor Administratively */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Cadastrar Novo Visitante</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Adicionar pessoa de primeira vez no banco administrativo</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <VisitorForm 
                  onSubmit={handleCreateSubmit} 
                  isLoading={formIsLoading} 
                  buttonText="Registrar Visitante"
                  successMessage={feedbackMsg?.type === 'success' ? feedbackMsg.text : null}
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
