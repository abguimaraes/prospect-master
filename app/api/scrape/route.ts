import { NextRequest, NextResponse } from 'next/server';
import {
  iniciarScrapingInstagram,
  iniciarScrapingFacebook,
  iniciarScrapingGoogle,
} from '@/lib/apify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plataforma, query, cidade, limite = 20 } = body as {
      plataforma: string;
      query: string;
      cidade: string;
      limite?: number;
    };

    if (!query || !cidade) {
      return NextResponse.json(
        { erro: 'query e cidade são obrigatórios' },
        { status: 400 }
      );
    }

    let runId: string;
    let datasetId: string;

    switch (plataforma) {
      case 'instagram':
        ({ runId, datasetId } = await iniciarScrapingInstagram(query, cidade, limite));
        break;
      case 'facebook':
        ({ runId, datasetId } = await iniciarScrapingFacebook(query, cidade, limite));
        break;
      case 'google':
        ({ runId, datasetId } = await iniciarScrapingGoogle(query, cidade, limite));
        break;
      default:
        return NextResponse.json({ erro: 'Plataforma inválida' }, { status: 400 });
    }

    return NextResponse.json({ status: 'iniciado', runId, datasetId, plataforma });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
