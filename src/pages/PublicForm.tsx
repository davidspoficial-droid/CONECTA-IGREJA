import { useState, useEffect } from 'react';
import { VisitorForm } from '../components/VisitorForm';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';
import { Church, Lock, HeartHandshake, CheckCircle2 } from 'lucide-react';

export function PublicForm() {
  const { navigate } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  // Local configurations
  const [config, setConfig] = useState({
    nome: 'Conecta Igreja',
    logo_url: ''
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('conecta_configuracao');
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCreateVisitor = async (formData: any) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      // Inserir no Supabase (seja o real ou o mock localStorage)
      const { data, error } = await supabase
        .from('visitantes')
        .insert([{
          nome_completo: formData.nome_completo,
          idade: formData.idade,
          telefone: formData.telefone,
          sexo: formData.sexo,
          pedido_oracao: formData.pedido_oracao,
          observacao: formData.observacao,
          equipe: formData.equipe,
          pastor_responsavel: formData.pastor_responsavel,
          consolidador: formData.consolidador,
          culto: formData.culto,
          status: 'Novo'
        }]);

      if (error) {
        throw new Error(error.message);
      }

      setRegisteredName(formData.nome_completo);
      setShowSuccessModal(true);
      setStatusMessage({
        type: 'success',
        text: 'Visitante cadastrado com sucesso! A igreja já foi notificada.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Houve uma falha ao enviar o formulário. Por favor, tente novamente.'
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1015] via-[#070b0e] to-[#010203] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Decorative ambient lights with beautiful deep slate / charcoal hues */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1015]/90 via-[#070b0e]/95 to-[#010203] pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#101419] rounded-full filter blur-[120px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#040608] rounded-full filter blur-[120px] opacity-45 pointer-events-none"></div>

      {/* Left Sidebar / Desktop Header (visible on LG screens, custom view elsewise) */}
      <aside className="hidden lg:flex lg:w-2/5 p-16 flex-col justify-between relative z-10 bg-transparent animate-slide-up">
        <div className="space-y-6">
          <div className="flex items-center space-x-3.5 mb-14">
            {config.logo_url ? (
              <img 
                src={config.logo_url} 
                alt="Logo da Igreja" 
                className="w-10 h-10 object-contain rounded-lg border border-white/10 shadow-lg shadow-black/40"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-sky-300 rounded-lg flex items-center justify-center shadow-lg text-indigo-950 font-bold shrink-0">
                <Church size={20} />
              </div>
            )}
            <span className="text-xl font-heading font-bold tracking-tight text-white">{config.nome}</span>
          </div>

          <h1 className="text-5xl xl:text-7xl font-heading font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            BOAS-VINDAS <br/> AO REINO
          </h1>

          {/* Decorative quotes badge */}
          <div className="border border-white/5 bg-white/5 backdrop-blur-md p-5 rounded-2xl max-w-xs mt-8 shadow-xl">
            <p className="text-xs sm:text-sm text-indigo-100 italic font-serif leading-relaxed">
              "Alegrei-me quando me disseram: Vamos à Casa do Senhor."
            </p>
            <span className="block text-[10px] font-mono tracking-widest text-blue-400 uppercase mt-2.5 font-bold">Salmo 122:1</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-[1px] w-full bg-white/10"></div>
          <div className="flex justify-center items-center text-xs">
            <button 
              onClick={() => navigate('/login')}
              id="btn-goto-login-aside"
              className="text-indigo-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              Área Administrativa →
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header (visible only on mobile/tablet) */}
      <header className="lg:hidden w-full p-6 flex flex-row items-center gap-4 relative z-10 pb-4">
        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg"></div>
          {config.logo_url ? (
            <img 
              src={config.logo_url} 
              alt="Logo da Igreja" 
              className="w-14 h-14 object-contain rounded-2xl border border-white/10 relative z-10 shadow-lg shadow-black/40"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-300 relative z-10 flex items-center justify-center text-indigo-950 shadow-lg font-bold">
              <Church size={26} />
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-left leading-tight">{config.nome}</h1>
      </header>

      {/* Main Form container (asymmetric placement on desktop) */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 flex items-center justify-center relative z-10 overflow-y-auto">
        <div className="w-full max-w-xl animate-slide-up">
          
          <VisitorForm 
            onSubmit={handleCreateVisitor} 
            isLoading={isLoading} 
            buttonText="CONCLUIR CADASTRO"
            successMessage={statusMessage?.type === 'success' ? statusMessage.text : null}
            errorMessage={statusMessage?.type === 'error' ? statusMessage.text : null}
          />
        </div>
      </main>

      {/* Mobile login button at the very bottom */}
      <div className="lg:hidden w-full text-center py-5 relative z-10 border-t border-white/5 mt-auto">
        <button 
          onClick={() => navigate('/login')}
          id="btn-goto-login-mobile"
          className="text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer underline underline-offset-4 font-semibold"
        >
          Acesso à Área do Consolidador
        </button>
      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-blue-500/5 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-sky-400"></div>
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center mb-5 border border-emerald-500/20">
              <CheckCircle2 size={36} className="animate-scale-up" />
            </div>

            <h3 className="text-xl font-heading font-bold text-white mb-2">
              Seja Bem-vindo(a)!
            </h3>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Ficamos imensamente felizes em receber você, <strong className="text-blue-300 font-semibold">{registeredName}</strong>. 
              Sua presença é um presente de Deus para nós! Nossos consolidadores entrarão em contato em breve.
            </p>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                setRegisteredName('');
                setStatusMessage(null);
              }}
              id="btn-modal-close"
              className="w-full bg-gradient-to-r from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500 text-white font-bold py-3.5 rounded-xl transition-all font-mono tracking-widest text-xs uppercase cursor-pointer"
            >
              Fazer Novo Cadastro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
