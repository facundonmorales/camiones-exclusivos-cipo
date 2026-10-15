export default function Cargando() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-48 rounded-lg bg-line" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white ring-1 ring-line" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-white ring-1 ring-line" />
    </div>
  );
}
