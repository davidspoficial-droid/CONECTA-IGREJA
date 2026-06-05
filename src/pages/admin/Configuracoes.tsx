import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, Church, Users, Key, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function Configuracoes() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Core configurations
  const [nomeIgreja, setNomeIgreja] = useState('Conecta Igreja');
  const [logoUrl, setLogoUrl] = useState('');

  // Auxiliary lists
  const [equipes, setEquipes] = useState<any[]>([]);
  const [pastores, setPastores] = useState<any[]>([]);
  const [cultos, setCultos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Add item input fields
  const [newEquipe, setNewEquipe] = useState('');
  const [newPastor, setNewPastor] = useState('');
  const [newCulto, setNewCulto] = useState('');

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      // 1. Get Core Church Settings from LocalStorage
      const localSet = localStorage.getItem('conecta_configuracao');
      if (localSet) {
        const parsed = JSON.parse(localSet);
        setNomeIgreja(parsed.nome || 'Conecta Igreja');
        setLogoUrl(parsed.logo_url || '');
      }

      // 2. Fetch lists from databases
      const { data: eq } = await supabase.from('equipes').select('*').order('nome');
      if (eq) setEquipes(eq);

      const { data: pa } = await supabase.from('pastores').select('*').order('nome');
      if (pa) setPastores(pa);

      const { data: cu } = await supabase.from('cultos').select('*').order('nome');
      if (cu) setCultos(cu);

      // 3. Admin users list (with dynamic fallback if table is empty)
      const { data: us } = await supabase.from('usuarios').select('*');
      if (us && us.length > 0) {
        setUsuarios(us);
      } else {
        // Fallback standard listing for rich local demo
        setUsuarios([
          { id: '1', nome: 'Administrador Conecta', email: 'admin@igreja.com', perfil: 'Administrador', equipe: 'Geral' },
          { id: '2', nome: 'Cláudia Mendes', email: 'claudia@igreja.com', perfil: 'Consolidador', equipe: 'Equipe da Esperança' },
          { id: '3', nome: 'Aline Barros', email: 'aline@igreja.com', perfil: 'Consolidador', equipe: 'Equipe de Jovens' }
        ]);
      }
    } catch (err) {
      console.error('Falha ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSaveCoreSettings = () => {
    setLoading(true);
    try {
      const configObj = { nome: nomeIgreja.trim() || 'Conecta Igreja', logo_url: logoUrl.trim() };
      localStorage.setItem('conecta_configuracao', JSON.stringify(configObj));
      setSuccessMsg('Configurações principais de identidade salvas com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Add Equipe
  const handleAddEquipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipe.trim()) return;

    try {
      const { data, error } = await supabase
        .from('equipes')
        .insert([{ nome: newEquipe.trim(), cor_principal: '#fbbf24' }]);

      if (error) throw error;
      setNewEquipe('');
      await loadSettingsData();
    } catch (err) {
      console.error(err);
      alert('Falha ao inserir equipe.');
    }
  };

  // Delete Equipe
  const handleDeleteEquipe = async (id: string) => {
    try {
      const { error } = await supabase.from('equipes').delete().eq('id', id);
      if (error) throw error;
      await loadSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Pastor
  const handleAddPastor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPastor.trim()) return;

    try {
      const { error } = await supabase
        .from('pastores')
        .insert([{ nome: newPastor.trim() }]);

      if (error) throw error;
      setNewPastor('');
      await loadSettingsData();
    } catch (err) {
      console.error(err);
      alert('Falha ao inserir pastor.');
    }
  };

  // Delete Pastor
  const handleDeletePastor = async (id: string) => {
    try {
      const { error } = await supabase.from('pastores').delete().eq('id', id);
      if (error) throw error;
      await loadSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Culto
  const handleAddCulto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCulto.trim()) return;

    try {
      const { error } = await supabase
        .from('cultos')
        .insert([{ nome: newCulto.trim(), ativo: true }]);

      if (error) throw error;
      setNewCulto('');
      await loadSettingsData();
    } catch (err) {
      console.error(err);
      alert('Falha ao inserir culto.');
    }
  };

  // Delete Culto
  const handleDeleteCulto = async (id: string) => {
    try {
      const { error } = await supabase.from('cultos').delete().eq('id', id);
      if (error) throw error;
      await loadSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout activeTab="configuracoes">
      <div className="space-y-6">
        
        {/* Sync notification banner */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-4 rounded-2xl flex items-center gap-3.5 animate-slide-in">
            <CheckCircle2 className="shrink-0 text-emerald-400" size={20} />
            <span className="text-xs font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Configurations Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Section 1: Identidade da Igreja (Col Span 2) */}
          <div className="lg:col-span-2 bg-slate-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-md space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5 pb-2.5 border-b border-indigo-500/10">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Church size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">Identidade Visual da Igreja</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2">Nome Oficial da Igreja</label>
                  <input
                    type="text"
                    value={nomeIgreja}
                    onChange={(e) => setNomeIgreja(e.target.value)}
                    placeholder="Ex: Igreja Evangélica Conexão da Graça"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2">Logo URL (Imagem Pública em Https)</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/sua-logo.png"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {logoUrl && (
                  <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <img 
                      src={logoUrl} 
                      alt="Preview da Logo" 
                      className="w-16 h-16 object-contain rounded-xl border border-white/10"
                      onError={(e)=>{ (e.target as any).style.display='none'; }}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold mb-0.5">Visualização Ativa</span>
                      <p className="text-xs text-slate-400 leading-snug">Sua logo está carregada com sucesso e aparecerá no cabeçalho do formulário público de visitantes.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveCoreSettings}
              id="btn-save-church-identity"
              className="mt-6 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/10 active:scale-98"
            >
              <Save size={14} />
              <span>Gravar Identidade</span>
            </button>
          </div>

          {/* Section 2: Administradores Cadastrados */}
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 md:p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5 pb-2.5 border-b border-indigo-500/10">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Key size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">Usuários Administrativos</h3>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {usuarios.map((u, idx) => (
                  <div key={u.id || idx} className="bg-slate-950/55 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {u.nome?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <span className="block text-xs font-bold text-slate-200 truncate">{u.nome}</span>
                      <span className="block text-[10px] text-slate-500 truncate mt-0.5">{u.email}</span>
                    </div>
                    <span className="ml-auto text-[9px] bg-indigo-400/10 border border-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-md shrink-0">
                      {u.perfil}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-slate-950/40 p-3 rounded-xl border border-indigo-500/10 flex items-start gap-2.5 text-[10px] text-slate-400 leading-normal">
              <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Para cadastrar novos login oficiais de forma definitiva, utilize o dashboard do provedor de credenciais do Supabase Auth.</span>
            </div>
          </div>

          {/* Sub Row: Equipes list, Pastores list, Cultos lists (3 discrete columns) */}
          
          {/* Box A: Equipes */}
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 md:p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Users size={14} className="text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Gerenciar Equipes</h4>
            </div>

            <form onSubmit={handleAddEquipe} className="flex gap-2">
              <input
                type="text"
                value={newEquipe}
                onChange={(e) => setNewEquipe(e.target.value)}
                placeholder="Ex: Nova Equipe Fé"
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-400"
              />
              <button type="submit" className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl active:scale-95 cursor-pointer">
                <Plus size={14} />
              </button>
            </form>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {equipes.map((eq, index) => (
                <div key={eq.id || index} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-300">
                  <span className="font-medium truncate">{eq.nome}</span>
                  <button onClick={() => handleDeleteEquipe(eq.id)} className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {equipes.length === 0 && (
                <p className="text-[10px] text-slate-600 text-center py-4">Nenhuma equipe cadastrada.</p>
              )}
            </div>
          </div>

          {/* Box B: Pastores */}
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 md:p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Users size={14} className="text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Pastores Responsáveis</h4>
            </div>

            <form onSubmit={handleAddPastor} className="flex gap-2">
              <input
                type="text"
                value={newPastor}
                onChange={(e) => setNewPastor(e.target.value)}
                placeholder="Ex: Pr. Daniel"
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-400"
              />
              <button type="submit" className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl active:scale-95 cursor-pointer">
                <Plus size={14} />
              </button>
            </form>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {pastores.map((p, index) => (
                <div key={p.id || index} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-300">
                  <span className="font-medium truncate">{p.nome}</span>
                  <button onClick={() => handleDeletePastor(p.id)} className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {pastores.length === 0 && (
                <p className="text-[10px] text-slate-600 text-center py-4">Nenhum pastor cadastrado.</p>
              )}
            </div>
          </div>

          {/* Box C: Cultos */}
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 md:p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Users size={14} className="text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Cultos Disponíveis</h4>
            </div>

            <form onSubmit={handleAddCulto} className="flex gap-2">
              <input
                type="text"
                value={newCulto}
                onChange={(e) => setNewCulto(e.target.value)}
                placeholder="Ex: Jovens 18h"
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-emerald-450"
              />
              <button type="submit" className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl active:scale-95 cursor-pointer">
                <Plus size={14} />
              </button>
            </form>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {cultos.map((cu, index) => (
                <div key={cu.id || index} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-300">
                  <span className="font-medium truncate">{cu.nome}</span>
                  <button onClick={() => handleDeleteCulto(cu.id)} className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer text-right shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {cultos.length === 0 && (
                <p className="text-[10px] text-slate-600 text-center py-4">Nenhum culto cadastrado.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
