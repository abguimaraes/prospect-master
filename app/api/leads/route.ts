import { NextRequest, NextResponse } from 'next/server';
import { lerLeads } from '@/lib/storage';

export async function GET(_request: NextRequest) {
  try {
    const db = await lerLeads();
    return NextResponse.json(db);
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro ao carregar leads' },
      { status: 500 }
    );
  }
}
