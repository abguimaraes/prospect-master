'use client';

import { useEffect, useState } from 'react';
import type { Lead, Plataforma, StatusLead } from '@/lib/types';

interface Props {
  leads: Lead[];
  onFiltrar: (leads: Lead[]) => void;
}

export function FiltrosTabela({ leads, onFiltrar }: Props) {
  const [plataforma, setPlataforma] = useState<'' | Plataforma>('');
  const [status, setStatus] = useState<'' | StatusLead>('');

  useEffect(() => {
    let filtrados = leads;
    if (plataforma) filtrados = filtrados.filter((l) => l.plataforma === plataforma);
    if (status) filtrados = filtrados.filter((l) => l.status === status);
    onFiltrar(filtrados);
  }, [plataforma, status, leads, onFiltrar]);

  const filtrado = plataforma || status;
  const totalFiltrado = (() => {
    let f = leads;
    if (plataforma) f = f.filter((l) => l.plataforma === plataforma);
    if (status) f = f.filter((l) => l.status === status);
    return f.length;
  })();

  const selectClass =
    'bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500';

  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500">Plataforma</label>
        <select
          className={selectClass}
          value={plataforma}
          onChange={(e) => setPlataforma(e.target.value as '' | Plataforma)}
        >
          <option value="">Todas</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="google">Google</option>
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500">Status</label>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | StatusLead)}
        >
          <option value="">Todos</option>
          <option value="novo">Novo</option>
          <option value="mensagem_gerada">Com Mensagem</option>
          <option value="contatado">Contatado</option>
        </select>
      </div>

      {filtrado && (
        <span className="text-sm text-gray-400 self-end pb-1.5">
          {totalFiltrado} de {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
