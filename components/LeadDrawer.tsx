'use client';

import { useState, useEffect } from 'react';
import type { Lead } from '@/lib/types';
import { Badge } from './Badge';

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDrawer({ lead, onClose }: Props) {
  const [leadAtual, setLeadAtual] = useState<Lead | null>(lead);
  const [copiado, setCopiado] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Sincronizar estado local quando prop muda (troca de lead)
  useEffect(() => {
    setLeadAtual(lead);
    setErro(null);
    setCopiado(false);
  }, [lead]);

  if (!leadAtual) return null;

  async function copiarMensagem() {
    try {
      await navigator.clipboard.writeText(leadAtual!.mensagem!);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // fallback silencioso
    }
  }

  async function marcarComoContatado() {
    setIsUpdating(true);
    setErro(null);
    try {
      const res = await fetch(`/api/leads/${leadAtual!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'contatado' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? 'Erro ao atualizar status');
      setLeadAtual(data.lead);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setIsUpdating(false);
    }
  }

  async function gerarMensagem() {
    setIsGenerating(true);
    setErro(null);
    try {
      const res = await fetch('/api/gerar-mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: leadAtual!.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? 'Erro ao gerar mensagem');
      setLeadAtual(data.lead);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${leadAtual.nome}`}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 z-50 p-6 overflow-y-auto shadow-2xl"
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{leadAtual.nome}</h2>
            <div className="flex gap-2 mt-2">
              <Badge tipo="plataforma" valor={leadAtual.plataforma} />
              <Badge tipo="status" valor={leadAtual.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl ml-4 mt-1"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Ação: Marcar como Contatado */}
        {leadAtual.status !== 'contatado' && (
          <div className="mb-4">
            <button
              onClick={marcarComoContatado}
              disabled={isUpdating}
              className="w-full py-2 px-4 rounded text-sm font-medium transition-colors bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {isUpdating ? 'Atualizando...' : '✅ Marcar como Contatado'}
            </button>
            {erro && <p className="text-red-400 text-xs mt-1">{erro}</p>}
          </div>
        )}

        {/* Campos do lead */}
        <div className="space-y-4">

          {/* URL */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Perfil</p>
            <a
              href={leadAtual.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
            >
              {leadAtual.url}
            </a>
          </div>

          {/* Localização */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Localização</p>
            <p className="text-gray-300 text-sm">{leadAtual.cidade} — {leadAtual.estado}</p>
          </div>

          {/* Descrição */}
          {leadAtual.descricao && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Descrição</p>
              <p className="text-gray-300 text-sm leading-relaxed">{leadAtual.descricao}</p>
            </div>
          )}

          {/* Contato */}
          {leadAtual.contato && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contato</p>
              <p className="text-gray-300 text-sm">{leadAtual.contato}</p>
            </div>
          )}

          {/* Data de criação */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adicionado em</p>
            <p className="text-gray-300 text-sm">
              {new Date(leadAtual.criadoEm).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Data de contato */}
          {leadAtual.contatadoEm && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contatado em</p>
              <p className="text-gray-300 text-sm">
                {new Date(leadAtual.contatadoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Seção de mensagem */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Mensagem de Prospecção</p>

          {leadAtual.mensagem ? (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {leadAtual.mensagem}
              </p>
              <button
                onClick={copiarMensagem}
                className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
                  copiado
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {copiado ? '✓ Copiado!' : '📋 Copiar Mensagem'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm italic">Mensagem ainda não gerada</p>
              <button
                onClick={gerarMensagem}
                disabled={isGenerating}
                className="w-full py-2 px-4 rounded text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isGenerating ? '⏳ Gerando...' : '✨ Gerar Mensagem'}
              </button>
              {erro && (
                <p className="text-red-400 text-xs mt-1">{erro}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
