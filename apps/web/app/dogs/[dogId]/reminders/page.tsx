'use client';

import Link from 'next/link';
import { useDogReminders } from '../../../../lib/queries';

export default function DogRemindersPage({
  params,
}: {
  params: { dogId: string };
}): React.JSX.Element {
  const { dogId } = params;
  const { data, isLoading, isError } = useDogReminders(dogId);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href={`/dogs/${dogId}`}
        className="mb-6 inline-flex text-sm text-gray-500 hover:text-foreground"
      >
        ← Retour
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Rappels</h1>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {isError && <p className="text-sm text-red-500">Erreur de chargement</p>}

      {data && data.data.length === 0 && (
        <p className="text-sm text-gray-500">Aucun rappel enregistré.</p>
      )}

      {data && (
        <ul className="flex flex-col gap-3">
          {data.data.map((reminder) => (
            <li
              key={reminder.id}
              className={`rounded-xl border px-5 py-4 ${reminder.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
            >
              <div className="flex items-start justify-between">
                <p className="font-medium text-foreground">{reminder.label}</p>
                <span className="ml-4 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {reminder.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Échéance&nbsp;: {new Date(reminder.dueDate).toLocaleDateString('fr-FR')}
                {reminder.lastDoneAt !== null && (
                  <span>
                    &nbsp;· Fait le {new Date(reminder.lastDoneAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
