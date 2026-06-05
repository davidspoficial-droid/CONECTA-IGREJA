import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface RouterContextType {
  path: string;
  params: Record<string, string>;
  navigate: (to: string) => void;
  user: any;
  loadingAuth: boolean;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error: string | null }>;
  logoutUser: () => Promise<void>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname || '/');
  const [params, setParams] = useState<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Sync state with browser bar, support simple path rewriting
  useEffect(() => {
    const handleLocationChange = () => {
      let currentPath = window.location.pathname;
      // Handle hash-routing as safe fallback (e.g. if loaded as someurl/#/admin/dashboard)
      if (window.location.hash && window.location.hash.startsWith('#/')) {
        currentPath = window.location.hash.slice(1);
      }
      setPath(currentPath || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Listen to Supabase Auth state modifications
  useEffect(() => {
    let subscription: any = null;
    
    if (typeof supabase.auth.onAuthStateChange === 'function') {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          const localUser = localStorage.getItem('conecta_active_user');
          if (localUser) {
            setUser(JSON.parse(localUser));
          } else {
            setUser(null);
          }
        }
        setLoadingAuth(false);
      });
      subscription = res?.data?.subscription;
    }

    const checkInitAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
        } else {
          // If mock, check localStorage directly
          const localUser = localStorage.getItem('conecta_active_user');
          if (localUser) {
            setUser(JSON.parse(localUser));
          } else {
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Erro ao inicializar autenticação:', e);
      } finally {
        setLoadingAuth(false);
      }
    };

    checkInitAuth();

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Simple route parameter matching (e.g., /admin/visitantes/:id)
  useEffect(() => {
    if (path.startsWith('/admin/visitantes/') && path.split('/').length === 4) {
      const parts = path.split('/');
      setParams({ id: parts[3] });
    } else {
      setParams({});
    }
  }, [path]);

  const navigate = (to: string) => {
    // Standard routing & support hash routing for nesting environments
    window.history.pushState(null, '', to);
    setPath(to);
  };

  const loginUser = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user) {
      setUser(data.user);
      return { success: true, error: null };
    }

    return { success: false, error: 'Usuário inválido.' };
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <RouterContext.Provider value={{ path, params, navigate, user, loadingAuth, loginUser, logoutUser }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter deve ser usado dentro de um RouterProvider');
  }
  return context;
}
