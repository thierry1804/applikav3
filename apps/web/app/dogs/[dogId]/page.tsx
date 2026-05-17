'use client';

import Link from 'next/link';
import { useDog } from '../../../lib/queries';

const NAV_ITEMS = [
  { label: 'Carnet de santé', href: 'health' },
  { label: 'Rappels', href: 'reminders' },
  { label: 'Suivi de poids', href: 'weight' },
] as const;

export default function DogPage({ params }: { params: { dogId: string } }): React.JSX.Element {
  const { dogId } = params;
  const { data, isLoading, isError } = useDog(dogId);

  const dogName = data?.data.name ?? '…';

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/" className="mb-4 inline-flex text-sm text-gray-500 hover:text-foreground">
        ← Mes chiens
      </Link>

      {isLoading && <p className="mt-4 text-sm text-gray-500">Chargement…</p>}
      {isError && <p className="mt-4 text-sm text-red-500">Chien introuvable</p>}

      {!isLoading && !isError && (
        <>
          <h1 className="mb-2 mt-2 text-2xl font-semibold text-foreground">{dogName}</h1>
          {data?.data.breed !== null && data?.data.breed !== undefined && (
            <p className="mb-6 text-sm text-gray-500">{data.data.breed}</p>
          )}

          <ul className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/dogs/${dogId}/${item.href}`}
                  className="flex min-h-[52px] items-center rounded-xl border border-gray-200 px-5 font-medium text-foreground hover:border-coral"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
