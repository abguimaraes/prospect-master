// lib/storage.ts — Funções de persistência no Vercel Blob Storage

import { put, head } from '@vercel/blob';
import type { Lead, LeadsDatabase } from './types';

const BLOB_KEY = 'leads.json';

export async function lerLeads(): Promise<LeadsDatabase> {
  try {
    const blob = await head(BLOB_KEY);
    const res = await fetch(blob.url, { cache: 'no-store' });
    return await res.json();
  } catch {
    return { leads: [], atualizadoEm: new Date().toISOString(), total: 0 };
  }
}

export async function salvarLeads(db: LeadsDatabase): Promise<void> {
  db.atualizadoEm = new Date().toISOString();
  db.total = db.leads.length;
  await put(BLOB_KEY, JSON.stringify(db, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function adicionarLeads(
  novosLeads: Lead[]
): Promise<{ adicionados: number; duplicatas: number }> {
  const db = await lerLeads();
  const urlsExistentes = new Set(db.leads.map(l => l.url));
  const leadsNovos: Lead[] = [];
  let duplicatas = 0;
  for (const lead of novosLeads) {
    if (!urlsExistentes.has(lead.url)) {
      urlsExistentes.add(lead.url); // evita duplicatas dentro do mesmo lote
      leadsNovos.push(lead);
    } else {
      duplicatas++;
    }
  }
  db.leads = [...db.leads, ...leadsNovos];
  await salvarLeads(db);
  return { adicionados: leadsNovos.length, duplicatas };
}

export async function atualizarLead(
  id: string,
  campos: Partial<Lead>
): Promise<Lead> {
  const db = await lerLeads();
  const idx = db.leads.findIndex(l => l.id === id);
  if (idx === -1) throw new Error('Lead não encontrado: ' + id);
  db.leads[idx] = { ...db.leads[idx], ...campos };
  await salvarLeads(db);
  return db.leads[idx];
}
