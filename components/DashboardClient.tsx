'use client';

import { useState } from 'react';
import type { Lead } from '@/lib/types';
import { StatusCards } from './StatusCards';
import { FiltrosTabela } from './FiltrosTabela';
import { GerarParaTodosButton } from './GerarParaTodosButton';
import { NovaBuscaModal } from './NovaBuscaModal';
import { LeadsTable } from './LeadsTable';
import { LeadDrawer } from './LeadDrawer';

interface Props {
  leads: Lead[];
}

export function DashboardClient({ leads }: Props) {
  const [leadsFiltrados, setLeadsFiltrados] = useState<Lead[]>(leads);
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);

  return (
    <div>
      {/* Cards de status */}
      <StatusCards leads={leads} />

      {/* Barra de ações */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <NovaBuscaModal />
        <GerarParaTodosButton leads={leads} />
      </div>

      {/* Filtros */}
      <FiltrosTabela leads={leads} onFiltrar={setLeadsFiltrados} />

      {/* Tabela */}
      <LeadsTable
        leads={leadsFiltrados}
        onLeadClick={(lead) => setLeadSelecionado(lead)}
      />

      {/* Drawer de detalhes */}
      <LeadDrawer
        lead={leadSelecionado}
        onClose={() => setLeadSelecionado(null)}
      />
    </div>
  );
}
