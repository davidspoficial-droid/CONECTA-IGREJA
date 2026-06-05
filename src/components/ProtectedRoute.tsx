import { ReactNode, useEffect } from 'react';
import { useRouter } from '../utils/router';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loadingAuth, navigate } = useRouter();

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/login');
    }
  }, [user, loadingAuth, navigate]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute w-10 h-10 border-4 border-cyan-400 border-b-transparent rounded-full animate-spin-reverse"></div>
        </div>
        <p className="mt-6 text-sm text-indigo-200 tracking-widest font-mono animate-pulse">
          CONECTANDO IGREJA...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via the useEffect
  }

  return <>{children}</>;
}
