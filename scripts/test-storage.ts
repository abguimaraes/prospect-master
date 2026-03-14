// scripts/test-storage.ts — Teste manual do lib/storage.ts
// Executar: npx tsx scripts/test-storage.ts

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { lerLeads, salvarLeads, adicionarLeads, atualizarLead } from '../lib/storage';
import type { Lead } from '../lib/types';
import { randomUUID } from 'crypto';

async function main() {
  console.log('🧪 Testando lib/storage.ts\n');

  // 1. lerLeads() com Blob vazio → retorna objeto padrão
  console.log('1️⃣  lerLeads() — deve retornar { leads: [], total: 0 } se vazio');
  const db = await lerLeads();
  console.log(`   leads: ${db.leads.length}, total: ${db.total}\n`);

  // 2. adicionarLeads() com 3 leads, 1 duplicado
  console.log('2️⃣  adicionarLeads() — 3 leads, 1 duplicado');
  const novos: Lead[] = [
    { id: randomUUID(), nome: 'Loja A', plataforma: 'instagram', url: 'https://instagram.com/loja-a', cidade: 'Natal', estado: 'RN', descricao: 'Teste', status: 'novo', criadoEm: new Date().toISOString() },
    { id: randomUUID(), nome: 'Loja B', plataforma: 'facebook', url: 'https://facebook.com/loja-b', cidade: 'Recife', estado: 'PE', descricao: 'Teste', status: 'novo', criadoEm: new Date().toISOString() },
    { id: randomUUID(), nome: 'Loja A Duplicada', plataforma: 'instagram', url: 'https://instagram.com/loja-a', cidade: 'Natal', estado: 'RN', descricao: 'Duplicada', status: 'novo', criadoEm: new Date().toISOString() },
  ];
  const resultado = await adicionarLeads(novos);
  console.log(`   adicionados: ${resultado.adicionados}, duplicatas: ${resultado.duplicatas}`);
  console.log(`   esperado: adicionados=2, duplicatas=1\n`);

  // 3. atualizarLead() — mudar status
  console.log('3️⃣  atualizarLead() — mudar status de Loja A para mensagem_gerada');
  const dbAtual = await lerLeads();
  const lojaA = dbAtual.leads.find(l => l.nome === 'Loja A');
  if (lojaA) {
    const atualizado = await atualizarLead(lojaA.id, { status: 'mensagem_gerada', mensagem: 'Mensagem de teste!' });
    console.log(`   status: ${atualizado.status}`);
    console.log(`   mensagem: ${atualizado.mensagem}\n`);
  }

  // Limpar dados de teste
  console.log('🧹 Limpando dados de teste...');
  await salvarLeads({ leads: [], atualizadoEm: new Date().toISOString(), total: 0 });

  console.log('✅ Todos os testes passaram!');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
