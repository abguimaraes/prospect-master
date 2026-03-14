import { NextRequest, NextResponse } from 'next/server';
import {
  verificarStatusRun,
  salvarResultadosInstagram,
  salvarResultadosFacebook,
  salvarResultadosGoogle,
} from '@/lib/apify';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const plataforma = searchParams.get('plataforma') ?? '';
    const datasetId = searchParams.get('datasetId') ?? '';
    const cidade = searchParams.get('cidade') ?? '';

    const { status } = await verificarStatusRun(runId);

    if (status === 'RUNNING' || status === 'READY') {
      return NextResponse.json({ status });
    }

    if (status === 'SUCCEEDED' && datasetId) {
      let resultado: { adicionados: number; duplicatas: number };

      switch (plataforma) {
        case 'instagram':
          resultado = await salvarResultadosInstagram(datasetId, cidade);
          break;
        case 'facebook':
          resultado = await salvarResultadosFacebook(datasetId, cidade);
          break;
        case 'google':
          resultado = await salvarResultadosGoogle(datasetId, cidade);
          break;
        default:
          return NextResponse.json(
            { erro: 'Plataforma inválida para processar resultados' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        status: 'SUCCEEDED',
        leadsAdicionados: resultado.adicionados,
        duplicatas: resultado.duplicatas,
      });
    }

    return NextResponse.json({
      status,
      erro: 'Scraping falhou ou foi abortado',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
