'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Plataforma } from '@/lib/types';

type Fase = 'form' | 'aguardando' | 'concluido' | 'erro';

export function NovaBuscaModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [fase, setFase] = useState<Fase>('form');
  const [resultado, setResultado] = useState<{
    leadsAdicionados: number;
    duplicatas: number;
  } | null>(null);
  const [erroMsg, setErroMsg] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Form state
  const [plataforma, setPlataforma] = useState<Plataforma>('instagram');
  const [query, setQuery] = useState('');
  const [cidade, setCidade] = useState('');
  const [limite, setLimite] = useState(20);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function iniciarBusca(e: React.FormEvent) {
    e.preventDefault();
    setFase('aguardando');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plataforma, query, cidade, limite }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErroMsg(data.erro ?? 'Erro ao iniciar busca');
        setFase('erro');
        return;
      }

      const { runId, datasetId } = data as { runId: string; datasetId: string };

      // Polling a cada 5s
      intervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/scrape/status/${runId}?plataforma=${plataforma}&datasetId=${datasetId}&cidade=${encodeURIComponent(cidade)}`
          );
          const statusData = await statusRes.json();

          if (statusData.status === 'SUCCEEDED') {
            clearInterval(intervalRef.current!);
            setResultado({
              leadsAdicionados: statusData.leadsAdicionados ?? 0,
              duplicatas: statusData.duplicatas ?? 0,
            });
            setFase('concluido');
            router.refresh();
          } else if (statusData.status !== 'RUNNING' && statusData.status !== 'READY') {
            clearInterval(intervalRef.current!);
            setErroMsg('Scraping falhou. Tente novamente.');
            setFase('erro');
          }
        } catch {
          clearInterval(intervalRef.current!);
          setErroMsg('Erro ao verificar status da busca.');
          setFase('erro');
        }
      }, 5000);
    } catch {
      setErroMsg('Erro ao conectar com a API.');
      setFase('erro');
    }
  }

  function fechar() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsOpen(false);
    setFase('form');
    setResultado(null);
    setErroMsg('');
    setQuery('');
    setCidade('');
    setLimite(20);
    setPlataforma('instagram');
  }

  const inputClass =
    'w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-indigo-500';
  const btnPrimary =
    'px-4 py-2 rounded text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors';
  const btnSecondary =
    'px-4 py-2 rounded text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors';

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={btnPrimary}>
        🔍 Nova Busca
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-2xl">

            {/* Formulário */}
            {fase === 'form' && (
              <form onSubmit={iniciarBusca} className="space-y-4">
                <h2 className="text-lg font-bold text-white">Nova Busca de Leads</h2>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Plataforma</label>
                  <select
                    className={inputClass}
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value as Plataforma)}
                    required
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Busca</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Ex: loja utilidades domésticas"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Cidade</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Ex: Natal"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Limite de resultados</label>
                  <input
                    type="number"
                    className={inputClass}
                    min={1}
                    max={100}
                    value={limite}
                    onChange={(e) => setLimite(Number(e.target.value))}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className={btnPrimary}>
                    Buscar
                  </button>
                  <button type="button" onClick={fechar} className={btnSecondary}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Aguardando */}
            {fase === 'aguardando' && (
              <div className="text-center py-6 space-y-3">
                <p className="text-2xl">⏳</p>
                <p className="text-white font-medium">Buscando leads...</p>
                <p className="text-gray-400 text-sm">
                  Isso pode levar de 1 a 3 minutos. Aguarde.
                </p>
                <button onClick={fechar} className={btnSecondary}>
                  Fechar (busca continua em background)
                </button>
              </div>
            )}

            {/* Concluído */}
            {fase === 'concluido' && resultado && (
              <div className="text-center py-6 space-y-3">
                <p className="text-2xl">✅</p>
                <p className="text-white font-medium">Busca concluída!</p>
                <p className="text-gray-300 text-sm">
                  <span className="text-green-400 font-bold">{resultado.leadsAdicionados}</span> leads adicionados
                  {resultado.duplicatas > 0 && (
                    <span className="text-gray-500"> · {resultado.duplicatas} duplicatas ignoradas</span>
                  )}
                </p>
                <button onClick={fechar} className={btnPrimary}>
                  Fechar
                </button>
              </div>
            )}

            {/* Erro */}
            {fase === 'erro' && (
              <div className="text-center py-6 space-y-3">
                <p className="text-2xl">❌</p>
                <p className="text-red-400 text-sm">{erroMsg}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setFase('form')} className={btnPrimary}>
                    Tentar Novamente
                  </button>
                  <button onClick={fechar} className={btnSecondary}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
