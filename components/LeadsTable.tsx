'use client';

import type { Lead } from '@/lib/types';
import { Badge } from './Badge';

interface Props {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function LeadsTable({ leads, onLeadClick }: Props) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Nenhum lead encontrado</p>
        <p className="text-sm mt-1">Use &quot;Nova Busca&quot; para encontrar prospects.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Plataforma</th>
            <th className="px-4 py-3">Cidade</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onLeadClick(lead)}
              className="bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-white">{lead.nome}</td>
              <td className="px-4 py-3">
                <Badge tipo="plataforma" valor={lead.plataforma} />
              </td>
              <td className="px-4 py-3 text-gray-400">{lead.cidade} — {lead.estado}</td>
              <td className="px-4 py-3">
                <Badge tipo="status" valor={lead.status} />
              </td>
              <td className="px-4 py-3 text-gray-400">
                {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
