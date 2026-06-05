export interface Visitante {
  id: string;
  nome_completo: string;
  idade?: number;
  telefone?: string;
  sexo?: 'Masculino' | 'Feminino';
  pedido_oracao?: string;
  observacao?: string;
  equipe?: string;
  pastor_responsavel?: string;
  consolidador?: string;
  culto?: string;
  status: 'Novo' | 'Contato pendente' | 'Contato realizado' | 'Em acompanhamento' | 'Retornou à igreja' | 'Integrado' | 'Sem retorno';
  created_at?: string;
  updated_at?: string;
}

export interface Acompanhamento {
  id: string;
  visitante_id: string;
  observacao: string;
  status: string;
  data_acompanhamento: string;
  created_at?: string;
  visitantes?: {
    nome_completo: string;
  };
}

export interface Equipe {
  id: string;
  nome: string;
  cor_principal?: string;
  created_at?: string;
}

export interface Pastor {
  id: string;
  nome: string;
  created_at?: string;
}

export interface Culto {
  id: string;
  nome: string;
  dia?: string;
  horario?: string;
  ativo: boolean;
  created_at?: string;
}

export interface IgrejaConfig {
  nome: string;
  logo_url?: string;
}

export interface Usuario {
  id: string;
  auth_user_id?: string;
  nome: string;
  email: string;
  perfil: 'Administrador' | 'Consolidador';
  equipe?: string;
  created_at?: string;
}
