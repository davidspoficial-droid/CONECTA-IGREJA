import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Check if credentials are real/provided
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Define Mock DB structure for rich default experience in local mode
const DEFAULT_VISITANTES = [
  {
    id: 'v1',
    nome_completo: 'Mariana Silva Souza',
    idade: 28,
    telefone: '11987654321',
    sexo: 'Feminino',
    pedido_oracao: 'Pela saúde de minha família e por direção profissional.',
    equipe: 'Equipe da Esperança',
    pastor_responsavel: 'Pr. Márcio Oliveira',
    consolidador: 'Cláudia Mendes',
    culto: 'Domingo 19h',
    status: 'Novo',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'v2',
    nome_completo: 'Lucas Rocha Santos',
    idade: 34,
    telefone: '21999887766',
    sexo: 'Masculino',
    pedido_oracao: 'Agradecimento por provisão financeira.',
    equipe: 'Equipe da Fé',
    pastor_responsavel: 'Pr. Carlos Santos',
    consolidador: 'Roberto Costa',
    culto: 'Sábado 19h',
    status: 'Contato realizado',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'v3',
    nome_completo: 'Beatriz Alencar Nunes',
    idade: 19,
    telefone: '81981223344',
    sexo: 'Feminino',
    pedido_oracao: 'Pelos estudos na faculdade e sabedoria.',
    equipe: 'Equipe de Jovens',
    pastor_responsavel: 'Pr. Lucas Ferreira',
    consolidador: 'Aline Barros',
    culto: 'Domingo 17h',
    status: 'Em acompanhamento',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'v4',
    nome_completo: 'Guilherme Barbosa Reis',
    idade: 42,
    telefone: '31977665544',
    sexo: 'Masculino',
    pedido_oracao: 'Minha esposa está com dores lombares, peço oração por cura.',
    equipe: 'Equipe Restaurar',
    pastor_responsavel: 'Pr. Márcio Oliveira',
    consolidador: 'Geraldo Antunes',
    culto: 'Domingo 19h',
    status: 'Contato pendente',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'v5',
    nome_completo: 'Daniela Ferreira Lima',
    idade: 25,
    telefone: '11966554433',
    sexo: 'Feminino',
    pedido_oracao: 'Reconciliação com os caminhos do Senhor.',
    equipe: 'Equipe da Fé',
    pastor_responsavel: 'Pr. Carlos Santos',
    consolidador: 'Marta Ribeiro',
    culto: 'Terça-feira 19h30',
    status: 'Integrado',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_ACOMPANHAMENTOS = [
  {
    id: 'a1',
    visitante_id: 'v2',
    observacao: 'Fizemos o primeiro contato telefônico. Ele foi super receptivo, agradeceu a ligação e disse que gostou muito do louvor.',
    status: 'Contato realizado',
    data_acompanhamento: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a2',
    visitante_id: 'v3',
    observacao: 'Encontramos com a Beatriz no culto de domingo passado e tomamos um café. Ela já está se integrando com a galera de jovens!',
    status: 'Em acompanhamento',
    data_acompanhamento: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_EQUIPES = [
  { id: '1', nome: 'Equipe da Esperança', cor_principal: '#3b82f6' },
  { id: '2', nome: 'Equipe da Fé', cor_principal: '#10b981' },
  { id: '3', nome: 'Equipe de Jovens', cor_principal: '#8b5cf6' },
  { id: '4', nome: 'Equipe Restaurar', cor_principal: '#f59e0b' }
];

const DEFAULT_PASTORES = [
  { id: '1', nome: 'Pr. Márcio Oliveira' },
  { id: '2', nome: 'Pr. Carlos Santos' },
  { id: '3', nome: 'Pr. Lucas Ferreira' }
];

const DEFAULT_CULTOS = [
  { id: '1', nome: 'Sábado 19h', dia: 'Sábado', horario: '19:00', ativo: true },
  { id: '2', nome: 'Terça-feira 19h30', dia: 'Terça-feira', horario: '19:30', ativo: true },
  { id: '3', nome: 'Domingo 10h', dia: 'Domingo', horario: '10:00', ativo: true },
  { id: '4', nome: 'Domingo 17h', dia: 'Domingo', horario: '17:00', ativo: true },
  { id: '5', nome: 'Domingo 19h', dia: 'Domingo', horario: '19:00', ativo: true }
];

// Seed standard data to LocalStorage if not exists
function getOrInitializeLocalStorage<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(stored);
}

// Generate high fidelity mock database provider
class MockSupabaseClient {
  private getTableData(table: string): any {
    switch (table) {
      case 'visitantes':
        return getOrInitializeLocalStorage('conecta_visitantes', DEFAULT_VISITANTES);
      case 'acompanhamentos':
        return getOrInitializeLocalStorage('conecta_acompanhamentos', DEFAULT_ACOMPANHAMENTOS);
      case 'equipes':
        return getOrInitializeLocalStorage('conecta_equipes', DEFAULT_EQUIPES);
      case 'pastores':
        return getOrInitializeLocalStorage('conecta_pastores', DEFAULT_PASTORES);
      case 'cultos':
        return getOrInitializeLocalStorage('conecta_cultos', DEFAULT_CULTOS);
      case 'configuracao':
        return getOrInitializeLocalStorage('conecta_configuracao', {
          nome: 'Conecta Igreja',
          logo_url: ''
        });
      default:
        return [];
    }
  }

  private saveTableData(table: string, data: any[]) {
    const key = {
      visitantes: 'conecta_visitantes',
      acompanhamentos: 'conecta_acompanhamentos',
      equipes: 'conecta_equipes',
      pastores: 'conecta_pastores',
      cultos: 'conecta_cultos',
      configuracao: 'conecta_configuracao'
    }[table];

    if (key) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  from(table: string) {
    const data = this.getTableData(table);
    let currentFilter: ((item: any) => boolean) | null = null;
    let selectedCol: string | null = null;

    const chain = {
      select: (columns = '*') => {
        selectedCol = columns;
        return chain;
      },
      insert: async (records: any | any[]) => {
        const list = Array.isArray(records) ? records : [records];
        const updatedList = [...data];
        const responseRecords = list.map(rec => {
          const newRecord = {
            id: rec.id || Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...rec
          };
          updatedList.push(newRecord);
          return newRecord;
        });

        this.saveTableData(table, updatedList);
        return { data: Array.isArray(records) ? responseRecords : responseRecords[0], error: null };
      },
      update: async (updates: any) => {
        return {
          eq: (field: string, val: any) => {
            const updated = data.map(item => {
              if (item[field] === val) {
                return { ...item, ...updates, updated_at: new Date().toISOString() };
              }
              return item;
            });
            this.saveTableData(table, updated);
            const altered = updated.filter(item => item[field] === val);
            return Promise.resolve({ data: altered, error: null });
          }
        };
      },
      delete: () => {
        return {
          eq: async (field: string, val: any) => {
            const filtered = data.filter(item => item[field] !== val);
            this.saveTableData(table, filtered);
            return { data: null, error: null };
          }
        };
      },
      eq: (field: string, val: any) => {
        currentFilter = (item) => item[field] === val;
        return chain;
      },
      order: (field: string, { ascending = true } = {}) => {
        // Simple mock sort
        data.sort((a, b) => {
          const valA = a[field] || '';
          const valB = b[field] || '';
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
        return chain;
      },
      // Promise custom resolver to behave like a standard return
      then: (resolve: any) => {
        let result = [...data];
        if (currentFilter) {
          result = result.filter(currentFilter);
        }
        
        // Enrich acompanhamentos with visitors for detail pages
        if (table === 'acompanhamentos') {
          const visitors = getOrInitializeLocalStorage('conecta_visitantes', DEFAULT_VISITANTES);
          result = result.map(acomp => {
            const vis = visitors.find(v => v.id === acomp.visitante_id);
            return {
              ...acomp,
              visitantes: vis ? { nome_completo: vis.nome_completo } : null
            };
          });
        }

        resolve({ data: result, error: null });
        return Promise.resolve({ data: result, error: null });
      }
    };

    return chain;
  }

  auth = {
    getUser: async () => {
      const activeUser = localStorage.getItem('conecta_active_user');
      if (activeUser) {
        return { data: { user: JSON.parse(activeUser) }, error: null };
      }
      return { data: { user: null }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      if (email === 'admin@igreja.com' && password === '123456') {
        const userObj = {
          id: 'admin-user-1',
          email,
          user_metadata: { nome_completo: 'Administrador Conecta' }
        };
        localStorage.setItem('conecta_active_user', JSON.stringify(userObj));
        return { data: { user: userObj }, error: null };
      }
      return { 
        data: { user: null }, 
        error: { message: 'Credenciais inválidas. Use o e-mail cadastrado ou admin@igreja.com com a senha 123456' } 
      };
    },
    signOut: async () => {
      localStorage.removeItem('conecta_active_user');
      return { error: null };
    }
  };
}

// Instantiate proper client based on configuration
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (new MockSupabaseClient() as any);
