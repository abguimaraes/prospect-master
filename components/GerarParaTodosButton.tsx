'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/types';

interface Props {
  leads: Lead[];
}

export function GerarParaTodosButton({ leads }: Props) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultado, setResultado] = useState<{
    processados: number;
    erros: number;
    total: number;
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const temLeadsNovos = leads.some((l) => l.status === 'novo');
  if (!temLeadsNovos) return null;

  async function gerarParaTodos() {
    setIsGenerating(true);
    setResultado(null);
    setErro(null);
    try {
      const res = await fetch('/api/gerar-mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todos: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? 'Erro na geração em lote');
      setResultado({ processados: data.processados, erros: data.erros, total: data.total });
      router.refresh();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={gerarParaTodos}
        disabled={isGenerating}
        className="px-4 py-2 rounded text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white"
      >
        {isGenerating ? '⏳ Gerando mensagens...' : '✨ Gerar para Todos'}
      </button>

      {resultado && (
        <p className="text-sm text-gray-400">
          {resultado.processados} gerada{resultado.processados !== 1 ? 's' : ''}
          {resultado.erros > 0 && (
            <span className="text-red-400"> · {resultado.erros} erro{resultado.erros !== 1 ? 's' : ''}</span>
          )}
        </p>
      )}

      {erro && <p className="text-sm text-red-400">{erro}</p>}
    </div>
  );
}
