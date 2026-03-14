import type { Plataforma, StatusLead } from '@/lib/types';

interface Props {
  tipo: 'status' | 'plataforma';
  valor: StatusLead | Plataforma;
}

const STATUS_CLASSES: Record<StatusLead, string> = {
  novo: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  mensagem_gerada: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  contatado: 'bg-green-500/20 text-green-300 border border-green-500/30',
};

const STATUS_LABELS: Record<StatusLead, string> = {
  novo: 'Novo',
  mensagem_gerada: 'Com Mensagem',
  contatado: 'Contatado',
};

const PLATAFORMA_CLASSES: Record<Plataforma, string> = {
  instagram: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  facebook: 'bg-blue-700/20 text-blue-300 border border-blue-700/30',
  google: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

const PLATAFORMA_LABELS: Record<Plataforma, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
};

export function Badge({ tipo, valor }: Props) {
  const className =
    tipo === 'status'
      ? STATUS_CLASSES[valor as StatusLead]
      : PLATAFORMA_CLASSES[valor as Plataforma];

  const label =
    tipo === 'status'
      ? STATUS_LABELS[valor as StatusLead]
      : PLATAFORMA_LABELS[valor as Plataforma];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
