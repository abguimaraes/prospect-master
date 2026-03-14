import type { Lead } from '@/lib/types';

interface Props {
  leads: Lead[];
}

export function StatusCards({ leads }: Props) {
  const total = leads.length;
  const novos = leads.filter((l) => l.status === 'novo').length;
  const comMensagem = leads.filter((l) => l.status === 'mensagem_gerada').length;
  const contatados = leads.filter((l) => l.status === 'contatado').length;

  const cards = [
    {
      label: 'Total',
      valor: total,
      cor: 'bg-blue-900/20 text-blue-300 border border-blue-800/30',
      icone: '📋',
    },
    {
      label: 'Novos',
      valor: novos,
      cor: 'bg-yellow-900/20 text-yellow-300 border border-yellow-800/30',
      icone: '🆕',
    },
    {
      label: 'Com Mensagem',
      valor: comMensagem,
      cor: 'bg-green-900/20 text-green-300 border border-green-800/30',
      icone: '✉️',
    },
    {
      label: 'Contatados',
      valor: contatados,
      cor: 'bg-purple-900/20 text-purple-300 border border-purple-800/30',
      icone: '✅',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.cor} rounded-lg p-4 flex flex-col items-center`}
          aria-label={`${card.label}: ${card.valor}`}
        >
          <span className="text-2xl mb-1">{card.icone}</span>
          <span className="text-3xl font-bold">{card.valor}</span>
          <span className="text-sm font-medium mt-1">{card.label}</span>
        </div>
      ))}
    </div>
  );
}
