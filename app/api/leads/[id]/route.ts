import { NextRequest, NextResponse } from 'next/server';
import { atualizarLead } from '@/lib/storage';
import type { StatusLead } from '@/lib/types';

const STATUS_VALIDOS: StatusLead[] = ['novo', 'mensagem_gerada', 'contatado'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body as { status: StatusLead };

    if (!STATUS_VALIDOS.includes(status)) {
      return NextResponse.json(
        { erro: 'Status inválido: ' + status },
        { status: 400 }
      );
    }

    const updates: Partial<{ status: StatusLead; contatadoEm: string }> = { status };
    if (status === 'contatado') {
      updates.contatadoEm = new Date().toISOString();
    }

    const lead = await atualizarLead(id, updates);
    return NextResponse.json({ lead });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    const httpStatus = msg.includes('não encontrado') ? 404 : 500;
    return NextResponse.json({ erro: msg }, { status: httpStatus });
  }
}
