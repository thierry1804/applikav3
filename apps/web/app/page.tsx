export default function HomePage(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold text-foreground">DogApp</h1>
      <p className="text-foreground/80">Tableau de bord web — MVP en cours de développement.</p>
      <a
        href="/health"
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-coral px-4 text-white"
      >
        Carnet de santé
      </a>
    </main>
  );
}
