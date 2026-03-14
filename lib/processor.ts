// lib/processor.ts — Orquestra geração de mensagem e persistência no Blob

import { gerarMensagem } from './gemini';
import { lerLeads, atualizarLead } from './storage';
import type { Lead } from './types';

export async function processarLead(leadId: string): Promise<Lead> {
  const db = await lerLeads();
  const lead = db.leads.find((l) => l.id === leadId);

  if (!lead) {
    throw new Error('Lead não encontrado: ' + leadId);
  }

  const mensagem = await gerarMensagem(lead);

  const leadAtualizado = await atualizarLead(leadId, {
    mensagem,
    status: 'mensagem_gerada',
  });

  return leadAtualizado;
}
