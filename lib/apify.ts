// lib/apify.ts — Client para Apify REST API

import { randomUUID } from 'crypto';
import type { Lead } from './types';
import { adicionarLeads } from './storage';

const APIFY_BASE_URL = 'https://api.apify.com/v2';

async function apifyFetch(path: string, options: RequestInit = {}) {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('APIFY_TOKEN não configurado');

  const res = await fetch(`${APIFY_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Apify API error ${res.status}: ${error}`);
  }

  return res.json();
}

// ── Instagram ────────────────────────────────────────────────────────────────

export async function iniciarScrapingInstagram(
  query: string,
  cidade: string,
  limite: number = 20
): Promise<{ runId: string; datasetId: string }> {
  const actorId = 'apify~instagram-scraper';
  const data = await apifyFetch(`/acts/${actorId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      hashtags: [query.replace(/\s+/g, '').toLowerCase()],
      resultsLimit: limite,
      resultsType: 'posts',
    }),
  });
  return { runId: data.data.id, datasetId: data.data.defaultDatasetId };
}

// ── Status e resultados (compartilhado por todos os scrapers) ─────────────────

export async function verificarStatusRun(
  runId: string
): Promise<{ status: string; datasetId: string }> {
  const data = await apifyFetch(`/actor-runs/${runId}`);
  return { status: data.data.status, datasetId: data.data.defaultDatasetId };
}

export async function buscarResultadosRun(
  datasetId: string
): Promise<unknown[]> {
  const data = await apifyFetch(`/datasets/${datasetId}/items?limit=100`);
  // A API retorna array direto ou { items: [] } dependendo do endpoint
  return Array.isArray(data) ? data : (data.items ?? []);
}

// ── Mapeamento Instagram → Lead ───────────────────────────────────────────────

function mapearInstagramParaLead(
  item: Record<string, unknown>,
  cidade: string
): Lead {
  const username = String(item.username ?? '');
  return {
    id: randomUUID(),
    nome: String(item.fullName ?? item.ownerUsername ?? username ?? 'Sem nome'),
    plataforma: 'instagram',
    url: `https://instagram.com/${username}`,
    cidade: String(item.city ?? cidade),
    estado: String(item.state ?? ''),
    descricao: String(item.biography ?? ''),
    contato: username ? `@${username}` : undefined,
    status: 'novo',
    criadoEm: new Date().toISOString(),
  };
}

export async function salvarResultadosInstagram(
  datasetId: string,
  cidade: string
): Promise<{ adicionados: number; duplicatas: number }> {
  const itens = await buscarResultadosRun(datasetId);
  const leads = (itens as Record<string, unknown>[]).map((item) =>
    mapearInstagramParaLead(item, cidade)
  );
  return adicionarLeads(leads);
}

// ── Facebook ─────────────────────────────────────────────────────────────────

export async function iniciarScrapingFacebook(
  query: string,
  cidade: string,
  limite: number = 20
): Promise<{ runId: string; datasetId: string }> {
  const actorId = 'apify~facebook-pages-scraper';
  const data = await apifyFetch(`/acts/${actorId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      search: `${query} ${cidade}`,
      maxItems: limite,
    }),
  });
  return { runId: data.data.id, datasetId: data.data.defaultDatasetId };
}

type FbItem = Record<string, unknown> & { address?: Record<string, unknown> };

function mapearFacebookParaLead(item: FbItem, cidade: string): Lead {
  const url = String(item.url ?? item.pageUrl ?? '');
  return {
    id: randomUUID(),
    nome: String(item.title ?? item.name ?? 'Sem nome'),
    plataforma: 'facebook',
    url,
    cidade: String(item.city ?? item.address?.city ?? cidade),
    estado: String(item.state ?? item.address?.state ?? ''),
    descricao: String(item.description ?? item.about ?? ''),
    contato: item.phone
      ? String(item.phone)
      : item.email
        ? String(item.email)
        : undefined,
    status: 'novo',
    criadoEm: new Date().toISOString(),
  };
}

export async function salvarResultadosFacebook(
  datasetId: string,
  cidade: string
): Promise<{ adicionados: number; duplicatas: number }> {
  const itens = await buscarResultadosRun(datasetId);
  const leads = (itens as FbItem[])
    .filter((item) => item.url ?? item.pageUrl) // ignorar itens sem URL
    .map((item) => mapearFacebookParaLead(item, cidade));
  return adicionarLeads(leads);
}

// ── Google ────────────────────────────────────────────────────────────────────

export async function iniciarScrapingGoogle(
  query: string,
  cidade: string,
  limite: number = 20
): Promise<{ runId: string; datasetId: string }> {
  const actorId = 'apify~google-search-scraper';
  const data = await apifyFetch(`/acts/${actorId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      queries: `${query} ${cidade} loja`,
      maxPagesPerQuery: Math.ceil(limite / 10),
    }),
  });
  return { runId: data.data.id, datasetId: data.data.defaultDatasetId };
}

function mapearGoogleParaLead(
  item: Record<string, unknown>,
  cidade: string
): Lead {
  return {
    id: randomUUID(),
    nome: String(item.title ?? 'Sem título'),
    plataforma: 'google',
    url: String(item.url ?? item.displayedUrl ?? ''),
    cidade,
    estado: '',
    descricao: String(item.description ?? item.snippet ?? ''),
    status: 'novo',
    criadoEm: new Date().toISOString(),
  };
}

export async function salvarResultadosGoogle(
  datasetId: string,
  cidade: string
): Promise<{ adicionados: number; duplicatas: number }> {
  const paginas = await buscarResultadosRun(datasetId);
  // Cada item é uma página de busca com organicResults aninhados
  const organicos = (paginas as Record<string, unknown>[]).flatMap(
    (pagina) => (pagina.organicResults as Record<string, unknown>[]) ?? []
  );
  const leads = organicos
    .filter((item) => item.url)
    .map((item) => mapearGoogleParaLead(item, cidade));
  return adicionarLeads(leads);
}
