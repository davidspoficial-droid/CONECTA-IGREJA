import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Visitante } from '../../types';
import { getStatusStyle } from '../../components/VisitorTable';
import { 
  FileDown, 
  Calendar, 
  Filter, 
  RefreshCw, 
  Users, 
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';

export function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [allVisitantes, setAllVisitantes] = useState<Visitante[]>([]);
  const [filtered, setFiltered] = useState<Visitante[]>([]);

  // Filter conditions
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [culto, setCulto] = useState('');
  const [equipe, setEquipe] = useState('');
  const [pastor, setPastor] = useState('');

  // Dropdown options
  const [equipes, setEquipes] = useState<string[]>([]);
  const [cultos, setCultos] = useState<string[]>([]);
  const [pastores, setPastores] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('visitantes').select('*');
      if (error) throw error;
      
      const list = data || [];
      setAllVisitantes(list);

      // Extract unique lists
      const eqSet = new Set<string>();
      const cuSet = new Set<string>();
      const paSet = new Set<string>();

      list.forEach((v: Visitante) => {
        if (v.equipe) eqSet.add(v.equipe);
        if (v.culto) cuSet.add(v.culto);
        if (v.pastor_responsavel) paSet.add(v.pastor_responsavel);
      });

      setEquipes(Array.from(eqSet));
      setCultos(Array.from(cuSet));
      setPastores(Array.from(paSet));

    } catch (err) {
      console.error('Falha ao ler relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter trigger
  useEffect(() => {
    let result = [...allVisitantes];

    if (startDate) {
      const sDate = new Date(startDate);
      result = result.filter(v => v.created_at ? new Date(v.created_at) >= sDate : true);
    }

    if (endDate) {
      const eDate = new Date(endDate);
      // set to end of that day
      eDate.setHours(23, 59, 59, 999);
      result = result.filter(v => v.created_at ? new Date(v.created_at) <= eDate : true);
    }

    if (status) {
      result = result.filter(v => v.status === status);
    }

    if (culto) {
      result = result.filter(v => v.culto === culto);
    }

    if (equipe) {
      result = result.filter(v => v.equipe === equipe);
    }

    if (pastor) {
      result = result.filter(v => v.pastor_responsavel === pastor);
    }

    setFiltered(result);
  }, [allVisitantes, startDate, endDate, status, culto, equipe, pastor]);

  // Clientside CSV compilation and export
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    // Header array
    const headers = [
      'Nome Completo',
      'Idade',
      'Telefone',
      'Sexo',
      'Culto Visitado',
      'Equipe de Consolidação',
      'Pastor Responsável',
      'Consolidador',
      'Pedido de Oração',
      'Status de Acompanhamento',
      'Data de Cadastro'
    ];

    // Build row strings
    const rows = filtered.map(v => [
      v.nome_completo,
      v.idade || '',
      v.telefone,
      v.sexo || '',
      v.culto || '',
      v.equipe || '',
      v.pastor_responsavel || '',
      v.consolidador || '',
      v.pedido_oracao ? v.pedido_oracao.replace(/\n/g, ' ') : '',
      v.status,
      v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : ''
    ]);

    // Construct spreadsheet content with quotes
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    // Generate blob and download link
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_visitantes_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout activeTab="relatorios">
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold tracking-widest block mb-1">
              CENTRAL ENGENHARIA DE DADOS E RELATÓRIOS
            </span>
            <p className="text-xs text-slate-500 font-medium">Filtre seus visitantes sob diferentes combinações e exporte para Excel.</p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white/5 border border-white/5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Multi query Filter panel */}
        <div className="bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest font-mono">
            <Filter size={14} />
            <span>Filtros do Relatório Estendido</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>

            {/* Status selection */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="">Todos</option>
                <option value="Novo">Novo</option>
                <option value="Contato pendente">Contato pendente</option>
                <option value="Contato realizado">Contato realizado</option>
                <option value="Em acompanhamento">Em acompanhamento</option>
                <option value="Retornou à igreja">Retornou à igreja</option>
                <option value="Integrado">Integrado</option>
                <option value="Sem retorno">Sem retorno</option>
              </select>
            </div>

            {/* Cult selecion */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Culto</label>
              <select
                value={culto}
                onChange={(e) => setCulto(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="">Todos</option>
                {cultos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Equipes */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Equipe</label>
              <select
                value={equipe}
                onChange={(e) => setEquipe(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="">Todas</option>
                {equipes.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
            </div>

            {/* Pastores */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Pastor</label>
              <select
                value={pastor}
                onChange={(e) => setPastor(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="">Todos</option>
                {pastores.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/5">
            <span className="text-[10px] text-slate-400 font-mono">
              Registros correspondentes: <strong className="text-sky-400 font-bold">{filtered.length}</strong> do total de {allVisitantes.length}
            </span>

            {filtered.length > 0 && (
              <button
                onClick={handleExportCSV}
                id="btn-export-csv"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-97 transition-all"
              >
                <FileDown size={14} />
                <span>Exportar Dados CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Results summary stats */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Filtered card */}
            <div className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Resultados Filtrados</span>
              <p className="text-xl font-bold mt-1 text-white">{filtered.length} pessoas</p>
            </div>
            {/* Status breakdown count */}
            <div className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Novos ou Pendentes</span>
              <p className="text-xl font-bold mt-1 text-sky-300">
                {filtered.filter(v => v.status === 'Novo' || v.status === 'Contato pendente').length} contatos
              </p>
            </div>
            {/* Active with prayer */}
            <div className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Pedidos de Oração no Lote</span>
              <p className="text-xl font-bold mt-1 text-indigo-300">
                {filtered.filter(v => v.pedido_oracao && v.pedido_oracao.trim().length > 0).length} pessoas
              </p>
            </div>
          </div>
        )}

        {/* Render Result Grid */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-slate-900/10 border border-white/5 rounded-3xl">
            <RefreshCw className="animate-spin text-blue-500 mb-2" size={24} />
            <p className="text-xs font-mono text-indigo-300 uppercase">Consultando banco...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-3xl">
            <FileSpreadsheet size={32} className="text-slate-600 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">Nenhum resultado filtrado coincide</p>
            <p className="text-xs text-slate-500 mt-1">Ajuste os parâmetros dos filtros para listar seus visitantes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900/20 border border-white/5 rounded-2xl shadow-xl backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-semibold">Nome Completo</th>
                  <th className="py-3.5 px-4 font-semibold">Telefone</th>
                  <th className="py-3.5 px-4 font-semibold">Culto</th>
                  <th className="py-3.5 px-4 font-semibold">Equipe</th>
                  <th className="py-3.5 px-4 font-semibold">Pastor</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-white/5">
                    <td className="py-3 px-5">
                      <div className="font-semibold text-white">{v.nome_completo}</div>
                      <div className="text-slate-500 mt-0.5">{v.idade ? `${v.idade} anos` : 'S/I'} • {v.sexo}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{v.telefone}</td>
                    <td className="py-3 px-4">{v.culto || '-'}</td>
                    <td className="py-3 px-4 font-medium">{v.equipe || '-'}</td>
                    <td className="py-3 px-4 text-indigo-300">{v.pastor_responsavel || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md whitespace-nowrap ${getStatusStyle(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-mono text-slate-400">
                      {v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
