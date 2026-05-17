'use client';

import Link from 'next/link';
import { useDogWeight } from '../../../../lib/queries';

export default function DogWeightPage({
  params,
}: {
  params: { dogId: string };
}): React.JSX.Element {
  const { dogId } = params;
  const { data, isLoading, isError } = useDogWeight(dogId);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href={`/dogs/${dogId}`}
        className="mb-6 inline-flex text-sm text-gray-500 hover:text-foreground"
      >
        ← Retour
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Suivi de poids</h1>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {isError && <p className="text-sm text-red-500">Erreur de chargement</p>}

      {data && data.data.length === 0 && (
        <p className="text-sm text-gray-500">Aucune pesée enregistrée.</p>
      )}

      {data && (
        <ul className="flex flex-col gap-2">
          {data.data.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 px-5 py-3"
            >
              <span className="text-lg font-semibold text-foreground">{entry.weightKg} kg</span>
              <span className="text-sm text-gray-500">
                {new Date(entry.measuredAt).toLocaleDateString('fr-FR')}
              </span>
              {entry.note !== null && (
                <span className="ml-2 text-sm text-gray-400">{entry.note}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
