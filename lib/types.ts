// lib/types.ts — Interfaces TypeScript do Prospect Master

export type Plataforma = 'instagram' | 'facebook' | 'google';
export type StatusLead = 'novo' | 'mensagem_gerada' | 'contatado';

export interface Lead {
  id: string;
  nome: string;
  plataforma: Plataforma;
  url: string;
  cidade: string;
  estado: string;
  descricao: string;
  contato?: string;
  status: StatusLead;
  mensagem?: string;
  criadoEm: string;
  contatadoEm?: string;
}

export interface LeadsDatabase {
  leads: Lead[];
  atualizadoEm: string;
  total: number;
}

export interface ScrapeRequest {
  plataforma: Plataforma;
  query: string;
  cidade: string;
  limite?: number;
}

export interface ScrapeResponse {
  status: 'iniciado' | 'erro';
  runId?: string;
  datasetId?: string;
  plataforma: Plataforma;
  erro?: string;
}

export interface ScrapeStatusResponse {
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED';
  leadsAdicionados?: number;
  duplicatas?: number;
  erro?: string;
}

export interface GerarMensagemRequest {
  leadId?: string;
  todos?: boolean;
}

export interface GerarMensagemResponse {
  sucesso: boolean;
  mensagem?: string;
  processados?: number;
  erros?: number;
  erro?: string;
}
