import React, { useState } from 'react';
import { useRouter } from '../utils/router';
import { Church, Lock, Mail, Key, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

export function Login() {
  const { loginUser, navigate, user } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Redireciona se já estiver logado
  if (user) {
    setTimeout(() => navigate('/admin/dashboard'), 50);
    return null;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText(null);

    // Básico
    if (!email.trim() || !password) {
      setErrorText('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      const { success, error } = await loginUser(email.trim(), password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setErrorText(error || 'Infelizmente essa conta não pôde ser autenticada. Verifique as credenciais.');
      }
    } catch (err) {
      setErrorText('Falha de conexão com os serviços de autenticação.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1015] via-[#070b0e] to-[#010203] text-white flex items-center justify-center p-4 font-sans relative selection:bg-blue-600 selection:text-white">
      
      {/* Decorative ambient lights with beautiful deep slate / blue hues */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d121a]/95 via-[#06090d]/98 to-[#010203] pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full filter blur-[150px] pointer-events-none animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-sky-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>

      {/* Login box wrapper */}
      <div className="w-full max-w-md z-10 flex flex-col gap-6 animate-slide-up">
        
        {/* Back to form button */}
        <button
          onClick={() => navigate('/')}
          id="btn-back-to-public"
          className="self-start flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Voltar ao Formulário</span>
        </button>

        {/* Card glass with Editorial high fidelity elevation, removed border and added elegant premium shadow */}
        <div className="bg-[#0b0e12]/80 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85),0_15px_45px_rgba(59,130,246,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-xl"></div>
          
          {/* Logo & Headline */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 mb-3.5">
              <Church size={24} />
            </div>
            
            <h2 className="text-xl font-heading font-bold text-white tracking-tight">
              Área Administrativa
            </h2>
            <p className="text-xs text-indigo-300 mt-1 font-medium italic">
              Acesse o Conecta Igreja com as suas credenciais
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Error notifications */}
            {errorText && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl animate-shake">
                <span className="font-semibold block">Falha de Acesso:</span>
                <span className="text-rose-400/90 mt-0.5 block">{errorText}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
                E-mail Administrativo
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@igreja.com"
                  className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-white/[0.04] rounded-full py-3.5 pl-12 pr-5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Mail size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-2">
                Palavra-passe / Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full bg-[#080b0e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border border-white/[0.04] rounded-full py-3.5 pl-12 pr-5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Key size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              id="btn-login-submit"
              className="w-full bg-gradient-to-r from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin text-white" size={18} />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span className="tracking-widest uppercase font-mono text-[11px]">Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Informative credentials suggestion */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-2xl shadow-lg">
          <p className="text-xs text-indigo-200 font-medium leading-relaxed">
            🔑 <strong className="text-blue-400 font-semibold text-[11px] uppercase tracking-wider block mb-1">Acesso do Painel de Teste</strong>
            Utilize <code className="bg-white/5 text-blue-300 px-1.5 py-0.5 rounded font-mono border border-white/5">admin@igreja.com</code> e senha <code className="bg-white/5 text-blue-300 px-1.5 py-0.5 rounded font-mono border border-white/5">123456</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
