// scripts/test-gemini.ts — Teste manual do cliente Gemini
// Executar: npx tsx scripts/test-gemini.ts

import { gerarMensagem } from '../lib/gemini';
import type { Lead } from '../lib/types';

const leadFicticio: Lead = {
  id: 'test-001',
  nome: 'Loja Preço Único da Silvana',
  plataforma: 'instagram',
  url: 'https://instagram.com/lojaprecounico_silvana',
  cidade: 'Natal',
  estado: 'RN',
  descricao: 'Loja de utilidades domésticas e brinquedos. Trabalhamos com os melhores preços da cidade!',
  status: 'novo',
  criadoEm: new Date().toISOString(),
};

async function main() {
  console.log('Gerando mensagem para:', leadFicticio.nome);
  console.log('---');
  const mensagem = await gerarMensagem(leadFicticio);
  console.log(mensagem);
  console.log('---');
  console.log('✓ Teste concluído');
}

main().catch(console.error);
