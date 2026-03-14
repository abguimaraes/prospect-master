import { lerLeads } from '@/lib/storage';
import { DashboardClient } from '@/components/DashboardClient';

export default async function Home() {
  const db = await lerLeads();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Prospect Master</h1>
          <p className="text-gray-400 text-sm mt-1">
            {db.total} lead{db.total !== 1 ? 's' : ''} encontrado{db.total !== 1 ? 's' : ''}
          </p>
        </div>

        <DashboardClient leads={db.leads} />
      </div>
    </main>
  );
}
