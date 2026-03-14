'use client';

import { useState } from 'react';
import type { Lead } from '@/lib/types';
import { LeadsTable } from './LeadsTable';
import { LeadDrawer } from './LeadDrawer';
import { GerarParaTodosButton } from './GerarParaTodosButton';

interface Props {
  initialLeads: Lead[];
}

export function LeadsDashboard({ initialLeads }: Props) {
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);

  return (
    <div>
      <div className="mb-4">
        <GerarParaTodosButton leads={initialLeads} />
      </div>
      <LeadsTable
        leads={initialLeads}
        onLeadClick={(lead) => setLeadSelecionado(lead)}
      />
      <LeadDrawer
        lead={leadSelecionado}
        onClose={() => setLeadSelecionado(null)}
      />
    </div>
  );
}
