// lib/gemini.ts — Cliente Gemini para geração de mensagens de prospecção

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Lead } from './types';

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

const SYSTEM_PROMPT = `
Você é um assistente de vendas B2B que ajuda Anderson a prospectar donos de lojas físicas
do comércio popular brasileiro (lojas de R$1,99, preço único, utilidades).

Anderson vende produtos importados — especialmente bolas recreativas e brinquedos —
com preços competitivos para revendedores.

A DOR do cliente: esses lojistas estão perdendo clientes para o e-commerce (Shopee,
Mercado Livre, AliExpress) que tem preços mais baixos e variedade maior.

REGRAS para a mensagem:
- Tom: direto, informal, sem enrolação (como conversa entre comerciantes)
- Tamanho: máximo 5 linhas
- Mencione o nome da loja/pessoa se disponível
- Mencione a cidade se disponível
- Não use mais de 1 emoji
- Foque na DOR (concorrência do e-commerce) e na SOLUÇÃO (produtos importados diferenciados)
- NÃO pareça robótico
`.trim();

function buildUserPrompt(lead: Lead): string {
  return `
Gere uma mensagem de prospecção para este lead:
- Nome/Loja: ${lead.nome}
- Plataforma: ${lead.plataforma}
- Cidade: ${lead.cidade || 'não informada'}
- Descrição: ${lead.descricao || 'não disponível'}
  `.trim();
}

export async function gerarMensagem(lead: Lead): Promise<string> {
  try {
    const model = getModel();
    const prompt = `${SYSTEM_PROMPT}\n\n${buildUserPrompt(lead)}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429) {
      throw new Error(
        'Limite de requisições da Gemini atingido. Aguarde 1 minuto e tente novamente.'
      );
    }
    throw new Error('Erro ao gerar mensagem: ' + (err.message ?? 'erro desconhecido'));
  }
}
