export default function Home() {
  return (
    <main className="flex min-h-svh flex-col justify-between p-6 md:p-10">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">
        Chronos
      </p>

      <h1 className="text-[clamp(2.5rem,9vw,9rem)] leading-[0.9] font-semibold tracking-tight uppercase">
        An Interactive History
        <br />
        of Computing
      </h1>

      <p className="font-mono text-xs tracking-widest text-muted uppercase">
        1940 — Today
      </p>
    </main>
  );
}
