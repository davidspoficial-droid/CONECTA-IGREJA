/**
 * Formata um número de telefone com máscara brasileira (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatarTelefone(value: string): string {
  if (!value) return '';
  
  // Remove tudo que não for dígito
  const apenasDigitos = value.replace(/\D/g, '');
  
  // Limita a no máximo 11 dígitos
  const limitado = apenasDigitos.slice(0, 11);
  
  if (limitado.length === 0) return '';
  if (limitado.length <= 2) return `(${limitado}`;
  if (limitado.length <= 6) return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
  
  if (limitado.length <= 10) {
    return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 6)}-${limitado.slice(6)}`;
  }
  
  return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
}

/**
 * Remove qualquer caractere que não seja número do telefone
 */
export function limparTelefone(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

/**
 * Gera o link padrão de WhatsApp para o telefone brasileiro especificado
 */
export function gerarLinkWhatsApp(telefone: string, nomeVisitante: string, nomeIgreja: string = 'Conecta Igreja'): string {
  const limpo = limparTelefone(telefone);
  if (!limpo) return '';
  
  // Garante o código do país 55 (Brasil) no início
  const comCodigoPais = limpo.startsWith('55') ? limpo : `55${limpo}`;
  
  const mensagemPronta = `Olá ${nomeVisitante}, paz!\n\nAqui é da igreja ${nomeIgreja}. Ficamos muito felizes com a sua visita.\n\nQueremos saber como você está e dizer que estamos orando por você. Será uma alegria receber você novamente em um dos nossos cultos.`;
  
  return `https://wa.me/${comCodigoPais}?text=${encodeURIComponent(mensagemPronta)}`;
}
