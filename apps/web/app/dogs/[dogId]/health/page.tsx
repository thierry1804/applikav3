'use client';

import Link from 'next/link';
import { useDogHealthRecords } from '../../../../lib/queries';

export default function DogHealthPage({
  params,
}: {
  params: { dogId: string };
}): React.JSX.Element {
  const { dogId } = params;
  const { data, isLoading, isError } = useDogHealthRecords(dogId);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href={`/dogs/${dogId}`}
        className="mb-6 inline-flex text-sm text-gray-500 hover:text-foreground"
      >
        ← Retour
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Carnet de santé</h1>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {isError && <p className="text-sm text-red-500">Erreur de chargement</p>}

      {data && data.data.length === 0 && (
        <p className="text-sm text-gray-500">Aucun enregistrement.</p>
      )}

      {data && (
        <ul className="flex flex-col gap-3">
          {data.data.map((record) => (
            <li key={record.id} className="rounded-xl border border-gray-200 px-5 py-4">
              <div className="flex items-start justify-between">
                <p className="font-medium text-foreground">{record.title}</p>
                <span className="ml-4 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {record.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(record.date).toLocaleDateString('fr-FR')}
                {record.vetName !== null && ` · ${record.vetName}`}
              </p>
              {record.description !== null && (
                <p className="mt-2 text-sm text-gray-700">{record.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
