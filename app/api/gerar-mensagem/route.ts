import { NextRequest, NextResponse } from 'next/server';
import { processarLead } from '@/lib/processor';
import { lerLeads } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, todos } = body as { leadId?: string; todos?: boolean };

    if (!leadId && !todos) {
      return NextResponse.json(
        { erro: 'Informe leadId ou todos: true' },
        { status: 400 }
      );
    }

    // Geração individual
    if (leadId) {
      const lead = await processarLead(leadId);
      return NextResponse.json({ lead });
    }

    // Geração em lote
    const db = await lerLeads();
    const leadsNovos = db.leads.filter((l) => l.status === 'novo');
    let processados = 0;
    let erros = 0;

    for (let i = 0; i < leadsNovos.length; i++) {
      try {
        await processarLead(leadsNovos[i].id);
        processados++;
      } catch {
        erros++;
      }
      // Respeitar rate limit Gemini: 15 RPM → ~4s entre chamadas
      if (i < leadsNovos.length - 1) {
        await new Promise((r) => setTimeout(r, 4000));
      }
    }

    return NextResponse.json({ processados, erros, total: leadsNovos.length });
  } catch (error: unknown) {
    const err = error as { message?: string };
    const msg = err.message ?? 'Erro desconhecido';
    const status = msg.includes('429') ? 429 : 500;
    return NextResponse.json({ erro: msg }, { status });
  }
}
