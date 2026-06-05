import React, { useState, useEffect } from 'react';
import { Visitante } from '../types';
import { formatarTelefone } from '../utils/mask';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  FileText, 
  ShieldAlert,
  Loader2,
  Users2,
  CheckCircle2,
  Mars,
  Venus,
  HandHeart
} from 'lucide-react';

interface VisitorFormProps {
  initialData?: Partial<Visitante>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  buttonText?: string;
  successMessage?: string | null;
  errorMessage?: string | null;
}

export function VisitorForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  buttonText = 'Concluir Cadastro',
  successMessage,
  errorMessage
}: VisitorFormProps) {
  // Input fields
  const [nomeCompleto, setNomeCompleto] = useState(initialData?.nome_completo || '');
  const [idade, setIdade] = useState(initialData?.idade ? String(initialData.idade) : '');
  const [telefone, setTelefone] = useState(initialData?.telefone || '');
  const [sexo, setSexo] = useState(initialData?.sexo || '');
  const [pedidoOracao, setPedidoOracao] = useState(initialData?.pedido_oracao || '');
  
  // Consolidation fields
  const [equipe, setEquipe] = useState(initialData?.equipe || '');
  const [pastorResponsavel, setPastorResponsavel] = useState(initialData?.pastor_responsavel || '');
  const [consolidador, setConsolidador] = useState(initialData?.consolidador || '');
  const [observacao, setObservacao] = useState(initialData?.observacao || '');
  const [culto, setCulto] = useState(initialData?.culto || '');
  const [status, setStatus] = useState<any>(initialData?.status || 'Novo');

  // Dynamic dropdown lists
  const [equipes, setEquipes] = useState<any[]>([]);
  const [pastores, setPastores] = useState<any[]>([]);
  const [cultos, setCultos] = useState<any[]>([]);

  // Validation local state
  const [showValidation, setShowValidation] = useState(false);

  // Load lists from DB / LocalStorage falling back to safe defaults
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const { data: listEquipes } = await supabase.from('equipes').select('*');
        if (listEquipes && listEquipes.length > 0) setEquipes(listEquipes);

        const { data: listPastores } = await supabase.from('pastores').select('*');
        if (listPastores && listPastores.length > 0) setPastores(listPastores);

        const { data: listCultos } = await supabase.from('cultos').select('*').order('nome');
        if (listCultos && listCultos.length > 0) {
          // Filter if we have active configuration
          setCultos(listCultos.filter((c: any) => c.ativo !== false));
        } else {
          // Default backup cultos
          setCultos([
            { id: '1', nome: 'Sábado 19h' },
            { id: '2', nome: 'Terça-feira 19h30' },
            { id: '3', nome: 'Domingo 10h' },
            { id: '4', nome: 'Domingo 17h' },
            { id: '5', nome: 'Domingo 19h' }
          ]);
        }
      } catch (err) {
        console.error('Falha ao carregar opções dinâmicas:', err);
      }
    };

    fetchDropdownData();
  }, []);

  // Update states if initialData changes (e.g. when loading details)
  useEffect(() => {
    if (initialData) {
      setNomeCompleto(initialData.nome_completo || '');
      setIdade(initialData.idade ? String(initialData.idade) : '');
      setTelefone(initialData.telefone ? formatarTelefone(initialData.telefone) : '');
      setSexo(initialData.sexo || '');
      setPedidoOracao(initialData.pedido_oracao || '');
      setEquipe(initialData.equipe || '');
      setPastorResponsavel(initialData.pastor_responsavel || '');
      setConsolidador(initialData.consolidador || '');
      setObservacao(initialData.observacao || '');
      setCulto(initialData.culto || '');
      setStatus(initialData.status || 'Novo');
    }
  }, [initialData]);

  // Handle phone changes to automatically apply the mask
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    setTelefone(formatted);
  };

  // Only permit numbers in age
  const handleIdadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '');
    setIdade(clean);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation - only Name is required now
    if (!nomeCompleto.trim()) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    // Call submit handler from parent with formatted types
    await onSubmit({
      nome_completo: nomeCompleto.trim(),
      idade: idade ? parseInt(idade, 10) : undefined,
      telefone,
      sexo: sexo || undefined,
      pedido_oracao: pedidoOracao.trim() || undefined,
      equipe: equipe || undefined,
      pastor_responsavel: pastorResponsavel || undefined,
      consolidador: consolidador.trim() || undefined,
      observacao: observacao.trim() || undefined,
      culto: culto || undefined,
      status: status
    });

    // If it's a first-time public form submission, clear form on success (handled by parent check as well)
    if (!initialData) {
      setNomeCompleto('');
      setIdade('');
      setTelefone('');
      setSexo('');
      setPedidoOracao('');
      setEquipe('');
      setPastorResponsavel('');
      setConsolidador('');
      setObservacao('');
      setCulto('');
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      
      {/* feedback message states */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-4 rounded-2xl flex items-start gap-3.5 animate-slide-in">
          <CheckCircle2 className="shrink-0 text-emerald-400 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Operação Realizada!</h4>
            <p className="text-xs text-emerald-400/90 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-5 py-4 rounded-2xl flex items-start gap-3.5 animate-slide-in">
          <ShieldAlert className="shrink-0 text-rose-400 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Aviso</h4>
            <p className="text-xs text-rose-400/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Seção 1: Dados do Visitante */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <User size={18} />
          </div>
          <h3 className="text-sm font-heading font-bold text-slate-100 tracking-wider">
            DADOS DO VISITANTE
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome Completo */}
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Nome Completo <span className="text-blue-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Ex: Gabriel Silva"
                className={`w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border rounded-full py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
                  showValidation && !nomeCompleto.trim() ? 'border-rose-500/80 bg-rose-950/20' : 'border-transparent'
                }`}
              />
              <User size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {showValidation && !nomeCompleto.trim() && (
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-rose-400 text-xs font-semibold animate-pulse">Obg.</span>
              )}
            </div>
          </div>

          {/* Telefone */}
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <input
                type="text"
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(11) 99999-9999"
                className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-full py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <Phone size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Idade */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Idade
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={idade}
                onChange={handleIdadeChange}
                placeholder="Ex: 25"
                className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-full py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <Calendar size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Sexo */}
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Sexo
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Masculino', 'Feminino'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSexo(option as any)}
                  className={`py-3 px-6 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    sexo === option 
                      ? 'bg-gradient-to-r from-blue-500/15 to-sky-300/15 border-blue-400 text-blue-300 font-bold shadow-md shadow-blue-500/5'
                      : 'bg-[#080b0e] shadow-[inset_0_4px_8px_rgba(0,0,0,0.7)] border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {option === 'Masculino' ? (
                    <Mars size={14} className={sexo === 'Masculino' ? 'text-blue-400' : 'text-slate-400'} />
                  ) : (
                    <Venus size={14} className={sexo === 'Feminino' ? 'text-pink-400' : 'text-slate-400'} />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Pedido de Oração */}
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Pedido de Oração / Mensagem
            </label>
            <div className="relative">
              <textarea
                value={pedidoOracao}
                onChange={(e) => setPedidoOracao(e.target.value)}
                placeholder="Sinta-se à vontade para compartilhar pedidos de oração ou observações..."
                rows={3}
                className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-2xl py-3 px-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
              <HandHeart size={16} className="absolute right-4.5 bottom-3.5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Linha de separação entre dados do visitante e do consolidador */}
      <div className="border-t border-white/[0.08] my-8"></div>

      {/* Seção 2: Dados da Consolidação */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Users2 size={18} />
          </div>
          <h3 className="text-sm font-heading font-bold text-slate-100 tracking-wider">
            DADOS DA CONSOLIDAÇÃO
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Culto */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Culto Visitado
            </label>
            <select
              value={culto}
              onChange={(e) => setCulto(e.target.value)}
              className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-full py-3 px-5 text-sm text-white/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option className="bg-[#080b0e] text-white" value="">Selecione o Culto</option>
              {cultos.map(c => (
                <option className="bg-[#080b0e] text-white" key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Equipe de Consolidação */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Equipe da Igreja
            </label>
            <select
              value={equipe}
              onChange={(e) => setEquipe(e.target.value)}
              className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-full py-3 px-5 text-sm text-white/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option className="bg-[#080b0e] text-white" value="">Selecione a Equipe</option>
              {equipes.map(eq => (
                <option className="bg-[#080b0e] text-white" key={eq.id} value={eq.nome}>{eq.nome}</option>
              ))}
              {equipes.length === 0 && (
                <>
                  <option className="bg-[#080b0e] text-white" value="Equipe da Esperança">Equipe da Esperança</option>
                  <option className="bg-[#080b0e] text-white" value="Equipe da Fé">Equipe da Fé</option>
                  <option className="bg-[#080b0e] text-white" value="Equipe de Jovens">Equipe de Jovens</option>
                  <option className="bg-[#080b0e] text-white" value="Equipe Restaurar">Equipe Restaurar</option>
                </>
              )}
            </select>
          </div>

          {/* Pastor Responsável */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Pastor Responsável
            </label>
            <select
              value={pastorResponsavel}
              onChange={(e) => setPastorResponsavel(e.target.value)}
              className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-full py-3 px-5 text-sm text-white/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option className="bg-[#080b0e] text-white" value="">Selecione o Pastor</option>
              {pastores.map(p => (
                <option className="bg-[#080b0e] text-white" key={p.id} value={p.nome}>{p.nome}</option>
              ))}
              {pastores.length === 0 && (
                <>
                  <option className="bg-[#080b0e] text-white" value="Pr. Márcio Oliveira">Pr. Márcio Oliveira</option>
                  <option className="bg-[#080b0e] text-white" value="Pr. Carlos Santos">Pr. Carlos Santos</option>
                  <option className="bg-[#080b0e] text-white" value="Pr. Lucas Ferreira">Pr. Lucas Ferreira</option>
                </>
              )}
            </select>
          </div>

          {/* Observação do Visitante */}
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
              Observações do Visitante
            </label>
            <div className="relative">
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Caso precise registrar alguma observação importante sobre o visitante ou o acompanhamento..."
                rows={3}
                className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-2xl py-3 px-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
              <FileText size={16} className="absolute right-4.5 bottom-3.5 text-slate-500" />
            </div>
          </div>

          {/* Status - Only visible in EDIT mode or if administrative toggles are enabled */}
          {initialData && (
            <div className="md:col-span-2 border-t border-white/5 pt-4">
              <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
                Status de Consolidação
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-transparent rounded-full py-3 px-5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option className="bg-[#080b0e] text-white" value="Novo">Novo</option>
                <option className="bg-[#080b0e] text-white" value="Contato pendente">Contato pendente</option>
                <option className="bg-[#080b0e] text-white" value="Contato realizado">Contato realizado</option>
                <option className="bg-[#080b0e] text-white" value="Em acompanhamento">Em acompanhamento</option>
                <option className="bg-[#080b0e] text-white" value="Retornou à igreja">Retornou à igreja</option>
                <option className="bg-[#080b0e] text-white" value="Integrado">Integrado</option>
                <option className="bg-[#080b0e] text-white" value="Sem retorno">Sem retorno</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        disabled={isLoading}
        id="btn-submit-form"
        className="w-full bg-gradient-to-r from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin text-slate-950" size={20} />
            <span className="tracking-widest uppercase text-xs font-mono">Salvando dados...</span>
          </>
        ) : (
          <span className="tracking-widest uppercase text-xs font-mono">{buttonText}</span>
        )}
      </button>
    </form>
  );
}
