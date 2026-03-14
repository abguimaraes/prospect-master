// scripts/test-blob.ts
// Testa a conexão com o Vercel Blob Storage
// Executar: npx tsx scripts/test-blob.ts

import { put, list, del } from '@vercel/blob';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega o .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN não encontrado no .env.local');
    console.error('   Siga as instruções para obter o token no Vercel Dashboard.');
    process.exit(1);
  }

  console.log('🔑 Token encontrado. Testando conexão com Vercel Blob...\n');

  try {
    // 1. Upload de arquivo de teste
    console.log('📤 Fazendo upload de arquivo de teste...');
    const { url } = await put('articles/blob.txt', 'Hello World!', {
      access: 'public',
      token,
    });
    console.log('✅ Upload concluído!');
    console.log('   URL:', url);

    // 2. Listar arquivos no Blob
    console.log('\n📋 Listando arquivos no Blob...');
    const { blobs } = await list({ token });
    console.log(`   ${blobs.length} arquivo(s) encontrado(s):`);
    blobs.forEach(b => console.log(`   - ${b.pathname} (${b.size} bytes)`));

    // 3. Remover arquivo de teste
    console.log('\n🗑️  Removendo arquivo de teste...');
    await del(url, { token });
    console.log('✅ Arquivo removido.');

    console.log('\n🎉 Vercel Blob funcionando corretamente!');
    console.log('   O projeto está pronto para usar armazenamento em nuvem.');

  } catch (error: any) {
    console.error('❌ Erro ao conectar ao Vercel Blob:');
    console.error('  ', error.message);
    process.exit(1);
  }
}

main();
