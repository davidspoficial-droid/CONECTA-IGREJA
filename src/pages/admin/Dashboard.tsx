import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Visitante } from '../../types';
import { 
  Users, 
  UserPlus, 
  CalendarClock, 
  UserCheck, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  Clock,
  Loader2,
  Calendar,
  Award,
  Cake,
  Activity,
  BarChart2,
  TrendingUp,
  Percent,
  Church
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid,
  Legend
} from 'recharts';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    semana: 0,
    mes: 0,
    ano: 0,
    masculino: 0,
    feminino: 0,
    outros: 0,
    ate12: 0,
    de13a17: 0,
    de18a29: 0,
    de30a49: 0,
    mais50: 0,
    semIdade: 0,
    mesesJanDez: Array(12).fill(0),
    cultosStats: [] as { nome: string; count: number }[]
  });

  const [graficoCulto, setGraficoCulto] = useState<any[]>([]);
  const [graficoEquipe, setGraficoEquipe] = useState<any[]>([]);
  const [graficoSexo, setGraficoSexo] = useState<any[]>([]);
  const [graficoStatus, setGraficoStatus] = useState<any[]>([]);
  const [graficoEvolucao, setGraficoEvolucao] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('visitantes').select('*');
      if (error) throw error;
      
      const list: Visitante[] = data || [];
      setVisitantes(list);

      // Metricas
      const agora = new Date();
      const anoCorrente = agora.getFullYear();
      
      // Sunday of the current week (Sunday 00:00:00)
      const inicioSemana = new Date(agora);
      const diaDaSemana = agora.getDay(); // 0 is Sunday, 1 is Monday ...
      inicioSemana.setDate(agora.getDate() - diaDaSemana);
      inicioSemana.setHours(0, 0, 0, 0);

      // First day of current calendar month (00:00:00)
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);

      let total = list.length;
      let semana = 0;
      let mes = 0;
      let ano = 0;
      
      // Sexo
      let masculino = 0;
      let feminino = 0;
      let outros = 0;
      
      // Idades (Faixas)
      let ate12 = 0;
      let de13a17 = 0;
      let de18a29 = 0;
      let de30a49 = 0;
      let mais50 = 0;
      let semIdade = 0;

      // Meses de Jan a Dez
      const mesesJanDez = Array(12).fill(0);

      // Cultos
      const cultosCount: Record<string, number> = {};

      list.forEach((v) => {
        const vDate = v.created_at ? new Date(v.created_at) : new Date();
        
        // Semana
        if (vDate >= inicioSemana) semana++;
        
        // Mês
        if (vDate >= inicioMes) mes++;
        
        // Ano e meses de Jan a Dez para o ano corrente
        if (vDate.getFullYear() === anoCorrente) {
          ano++;
          const mesIndex = vDate.getMonth(); // 0-11
          mesesJanDez[mesIndex]++;
        }

        // Sexo
        if (v.sexo === 'Masculino') {
          masculino++;
        } else if (v.sexo === 'Feminino') {
          feminino++;
        } else {
          outros++;
        }

        // Idades
        if (v.idade !== undefined && v.idade !== null) {
          const idade = Number(v.idade);
          if (isNaN(idade)) {
            semIdade++;
          } else if (idade <= 12) {
            ate12++;
          } else if (idade >= 13 && idade <= 17) {
            de13a17++;
          } else if (idade >= 18 && idade <= 29) {
            de18a29++;
          } else if (idade >= 30 && idade <= 49) {
            de30a49++;
          } else if (idade >= 50) {
            mais50++;
          } else {
            semIdade++;
          }
        } else {
          semIdade++;
        }

        // Cultos
        const c = v.culto || 'Geral / Não especificado';
        cultosCount[c] = (cultosCount[c] || 0) + 1;
      });

      const cultosStats = Object.entries(cultosCount)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count);

      setStats({ 
        total, 
        semana, 
        mes, 
        ano,
        masculino,
        feminino,
        outros,
        ate12,
        de13a17,
        de18a29,
        de30a49,
        mais50,
        semIdade,
        mesesJanDez,
        cultosStats
      });

      // Gráficos por Culto
      setGraficoCulto(Object.entries(cultosCount).map(([name, value]) => ({ name, value })));

      // Gráficos por Equipe
      const equipesCount: Record<string, number> = {};
      list.forEach(v => {
        const eq = v.equipe || 'Sem equipe';
        equipesCount[eq] = (equipesCount[eq] || 0) + 1;
      });
      setGraficoEquipe(Object.entries(equipesCount).map(([name, value]) => ({ name, value })));

      // Grafico por Sexo
      const sexoCount: Record<string, number> = {};
      list.forEach(v => {
        const s = v.sexo || 'Não informado';
        sexoCount[s] = (sexoCount[s] || 0) + 1;
      });
      setGraficoSexo(Object.entries(sexoCount).map(([name, value]) => ({ name, value })));

      // Grafico por Status
      const statusCount: Record<string, number> = {};
      list.forEach(v => {
        const st = v.status || 'Novo';
        statusCount[st] = (statusCount[st] || 0) + 1;
      });
      setGraficoStatus(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Evolução de Visitantes por Mês (ordered chronologically)
      // Sort copies of list by created_at ascending
      const sortedList = [...list].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });

      const evolução: Record<string, number> = {};
      sortedList.forEach(v => {
        if (v.created_at) {
          const date = new Date(v.created_at);
          const mesAno = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          evolução[mesAno] = (evolução[mesAno] || 0) + 1;
        }
      });
      setGraficoEvolucao(Object.entries(evolução).map(([name, value]) => ({ name, value })));

    } catch (err) {
      console.error('Erro ao ler métricas de visitantes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS_PIE = ['#3b82f6', '#0ea5e9', '#6366f1', '#a855f7', '#10b981', '#ec4899', '#14b8a6'];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-6">
        
        {/* Actions header bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif text-blue-100 tracking-wide">Painel de Consolidação</h2>
            <p className="text-xs text-slate-400">Visão geral do engajamento e integração de novos visitantes</p>
          </div>
          <button
            onClick={fetchDashboardData}
            id="btn-refresh-dashboard"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white/5 border border-white/5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 hover:border-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sincronizar Banco</span>
          </button>
        </div>

        {/* Grids de Metricas solicitados pelo usuário - MODO PREMIUM */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center bg-slate-900/10 border border-white/5 rounded-3xl backdrop-blur-md">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-sm font-mono text-indigo-300 tracking-widest uppercase">Mapeando dados da igreja...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Cards de Resumo Rápido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              
              {/* Card 1: Total Geral */}
              <div className="bg-[#090e15]/65 border border-white/5 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300 shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Total Geral</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-lg">
                    <Users size={16} />
                  </div>
                </div>
                <p className="text-3xl font-black text-white leading-none tracking-tight">{stats.total}</p>
                <span className="text-[10px] text-slate-500 font-medium mt-2.5 block">Acumulado histórico</span>
              </div>

              {/* Card 2: Total por Ano */}
              <div className="bg-[#090e15]/65 border border-white/5 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden group hover:border-sky-500/20 transition-all duration-300 shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Total Por Ano</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shadow-lg">
                    <CalendarClock size={16} />
                  </div>
                </div>
                <p className="text-3xl font-black text-sky-300 leading-none tracking-tight">{stats.ano}</p>
                <span className="text-[10px] text-sky-400/50 font-medium mt-2.5 block">Registrados em {new Date().getFullYear()}</span>
              </div>

              {/* Card 3: Por Semana */}
              <div className="bg-[#090e15]/65 border border-white/5 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Por Semana</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-lg">
                    <Clock size={16} />
                  </div>
                </div>
                <p className="text-3xl font-black text-emerald-400 leading-none tracking-tight">{stats.semana}</p>
                <span className="text-[10px] text-emerald-500/50 font-medium mt-2.5 block">Esta semana (Seg-Dom)</span>
              </div>

              {/* Card 4: Por Mês */}
              <div className="bg-[#090e15]/65 border border-white/5 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300 shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Por Mês</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shadow-lg">
                    <Calendar size={16} />
                  </div>
                </div>
                <p className="text-3xl font-black text-white leading-none tracking-tight">{stats.mes}</p>
                <span className="text-[10px] text-slate-500 font-medium mt-2.5 block capitalize">Mês corrente ({new Date().toLocaleDateString('pt-BR', { month: 'short' })})</span>
              </div>

            </div>

            {/* 2. Bento-Grid de Analises Detalhadas (Idade, Sexo, Culto) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              
              {/* Card 5: IDADE (ENTRE) */}
              <div className="bg-[#090e15]/45 border border-white/5 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/15 transition-all duration-300 lg:col-span-2 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Cake size={14} className="text-blue-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Idades (Entre)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Faixas de Idade</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 pt-1">
                  {[
                    { label: "Crianças (0 - 12)", value: stats.ate12 },
                    { label: "Adolescentes (13 - 17)", value: stats.de13a17 },
                    { label: "Jovens (18 - 29)", value: stats.de18a29 },
                    { label: "Adultos (30 - 49)", value: stats.de30a49 },
                    { label: "Sêniores (50+)", value: stats.mais50 },
                    { label: "Não informado", value: stats.semIdade },
                  ].map((item, idx) => {
                    const totalIdados = (stats.total || 1);
                    const pct = Math.round((item.value / totalIdados) * 100);
                    return (
                      <div key={idx} className="space-y-1 bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                        <div className="flex justify-between text-[11.5px] items-center">
                          <span className="text-slate-400 font-medium truncate max-w-[125px]">{item.label}</span>
                          <span className="text-slate-200 font-black font-mono">{item.value} <span className="text-[9px] text-slate-550 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 6: SEXO */}
              <div className="bg-[#090e15]/45 border border-white/5 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/15 transition-all duration-300 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-indigo-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Sexo (Distribuição)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Gênero</span>
                  </div>
                  
                  <div className="flex flex-col justify-center space-y-4 pt-2">
                    {/* Masculino */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11.5px]">
                        <span className="text-slate-400">Masculino</span>
                        <span className="text-sky-300 font-black font-mono">
                          {stats.masculino} <span className="text-[9px] text-slate-500 font-normal">({stats.total > 0 ? Math.round((stats.masculino / stats.total) * 100) : 0}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-sky-500 h-full rounded-full transition-all duration-1000 pointer-events-none"
                          style={{ width: `${stats.total > 0 ? (stats.masculino / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Feminino */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11.5px]">
                        <span className="text-slate-400">Feminino</span>
                        <span className="text-pink-400 font-black font-mono">
                          {stats.feminino} <span className="text-[9px] text-slate-500 font-normal">({stats.total > 0 ? Math.round((stats.feminino / stats.total) * 100) : 0}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-pink-500 h-full rounded-full transition-all duration-1000 pointer-events-none"
                          style={{ width: `${stats.total > 0 ? (stats.feminino / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Não Informado */}
                    {stats.outros > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11.5px]">
                          <span className="text-slate-500">Não Informado</span>
                          <span className="text-slate-300 font-black font-mono">
                            {stats.outros} <span className="text-[9px] text-slate-500 font-normal">({stats.total > 0 ? Math.round((stats.outros / stats.total) * 100) : 0}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-[#334155] h-full rounded-full transition-all duration-1000 pointer-events-none"
                            style={{ width: `${stats.total > 0 ? (stats.outros / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 7: POR CULTO */}
              <div className="bg-[#090e15]/45 border border-white/5 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/15 transition-all duration-300 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Church size={14} className="text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Por Culto</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Ranking</span>
                  </div>
                  
                  <div className="space-y-3 max-h-[145px] overflow-y-auto pr-1 select-none">
                    {stats.cultosStats.length > 0 ? (
                      stats.cultosStats.slice(0, 4).map((item, idx) => {
                        const totalCultos = (stats.total || 1);
                        const pct = Math.round((item.count / totalCultos) * 100);
                        return (
                          <div key={idx} className="space-y-1 bg-white/[0.01] border border-white/[0.02] p-1.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                            <div className="flex justify-between text-[11px] items-center">
                              <span className="text-slate-400 truncate max-w-[125px] font-medium" title={item.nome}>{item.nome}</span>
                              <span className="text-emerald-400 font-bold font-mono">{item.count} <span className="text-[9px] text-slate-500 font-normal">({pct}%)</span></span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 text-xs py-4 text-center">Nenhum culto com dados cadastrados.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Card 8: POR MÊS DE JAN A DEZ */}
            <div className="bg-[#090e15]/45 border border-white/5 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden group hover:border-sky-500/15 transition-all duration-300 shadow-xl animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-sky-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Por Mês (De Jan a Dez - Ano Corrente)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Sazonalidade Mensal</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-12 gap-3 pt-2">
                {[
                  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
                ].map((mesNome, index) => {
                  const valor = stats.mesesJanDez[index];
                  const maxVal = Math.max(...stats.mesesJanDez, 1);
                  const pctAltura = Math.max(4, Math.round((valor / maxVal) * 100)); // Pelo menos 4% de altura visual
                  
                  return (
                    <div key={index} className="flex lg:flex-col items-center justify-between lg:justify-end gap-2 lg:gap-3 bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-2xl hover:bg-white/[0.04] transition-all group/item duration-200">
                      {/* Nome do mês */}
                      <span className="text-[10.5px] font-bold text-slate-400 group-hover/item:text-sky-300 transition-colors uppercase tracking-wider">{mesNome}</span>
                      
                      {/* Barra de evolução vertical (visível em telas maiores) */}
                      <div className="hidden lg:flex w-full bg-slate-950/20 h-16 rounded-xl flex-col justify-end p-0.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-t from-blue-600 via-indigo-500 to-sky-400 rounded-lg w-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.25)]"
                          style={{ height: `${pctAltura}%` }}
                        />
                      </div>
                      
                      {/* Quantidade registrada */}
                      <div className="flex flex-col items-end lg:items-center">
                        <span className={`text-xs font-black font-mono ${valor > 0 ? 'text-white' : 'text-slate-600'}`}>{valor}</span>
                        <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Vis.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
