/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, useRouter } from './utils/router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicForm } from './pages/PublicForm';
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Visitantes } from './pages/admin/Visitantes';
import { VisitanteDetalhes } from './pages/admin/VisitanteDetalhes';
import { Relatorios } from './pages/admin/Relatorios';
import { Configuracoes } from './pages/admin/Configuracoes';

function NavigationHandler() {
  const { path } = useRouter();

  // 1. Matches: / or /formulario
  if (path === '/' || path === '/formulario') {
    return <PublicForm />;
  }

  // 2. Matches: /login
  if (path === '/login') {
    return <Login />;
  }

  // 3. Matches: /admin/dashboard
  if (path === '/admin/dashboard') {
    return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  // 4. Matches: /admin/visitantes
  if (path === '/admin/visitantes') {
    return (
      <ProtectedRoute>
        <Visitantes />
      </ProtectedRoute>
    );
  }

  // 5. Matches: /admin/visitantes/:id
  if (path.startsWith('/admin/visitantes/')) {
    return (
      <ProtectedRoute>
        <VisitanteDetalhes />
      </ProtectedRoute>
    );
  }

  // 6. Matches: /admin/relatorios
  if (path === '/admin/relatorios') {
    return (
      <ProtectedRoute>
        <Relatorios />
      </ProtectedRoute>
    );
  }

  // 7. Matches: /admin/configuracoes
  if (path === '/admin/configuracoes') {
    return (
      <ProtectedRoute>
        <Configuracoes />
      </ProtectedRoute>
    );
  }

  // 8. 404 Catch All
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-center p-6">
      <h2 className="text-4xl font-extrabold text-amber-400">404</h2>
      <p className="text-sm text-slate-400 mt-2">Caminho não encontrado no sistema Conecta Igreja.</p>
      <button 
        onClick={() => { window.location.href = '/'; }} 
        className="mt-6 px-4 py-2 bg-white/5 border border-white/10 hover:border-amber-400/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
      >
        Voltar para a Página Inicial
      </button>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <NavigationHandler />
    </RouterProvider>
  );
}
