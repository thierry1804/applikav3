'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../lib/auth';
import { useDogs } from '../lib/queries';

export default function HomePage(): React.JSX.Element {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);
  const { data, isLoading, isError } = useDogs();

  if (!hydrated) {
    return <main className="mx-auto max-w-3xl p-8" />;
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-2xl font-semibold text-foreground">DogApp</h1>
        <p className="text-sm text-gray-500">Tableau de bord santé de votre chien</p>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-lg bg-coral px-6 font-medium text-white"
        >
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Mes chiens</h1>
        <button onClick={clearToken} className="text-sm text-gray-500 hover:text-foreground">
          Déconnexion
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {isError && <p className="text-sm text-red-500">Erreur de chargement</p>}

      {data && (
        <ul className="flex flex-col gap-3">
          {data.data.map((dog) => (
            <li key={dog.id}>
              <Link
                href={`/dogs/${dog.id}`}
                className="flex min-h-[64px] items-center rounded-xl border border-gray-200 px-5 py-3 hover:border-coral"
              >
                <div>
                  <p className="font-medium text-foreground">{dog.name}</p>
                  {dog.breed !== null && <p className="text-sm text-gray-500">{dog.breed}</p>}
                </div>
              </Link>
            </li>
          ))}
          {data.data.length === 0 && (
            <p className="text-sm text-gray-500">Aucun chien enregistré.</p>
          )}
        </ul>
      )}
    </main>
  );
}
