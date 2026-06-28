// Renders a country flag from flagcdn.com given a 2-letter ISO code.
// Falls back to a neutral placeholder when no code is available.

export default function Flag({ code, className = "" }: { code?: string | null; className?: string }) {
  const base = `inline-block h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10 ${className}`;
  if (!code) {
    return <span className={`${base} bg-slate-300`} aria-hidden />;
  }
  const c = code.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${c}.png`}
      srcSet={`https://flagcdn.com/w80/${c}.png 2x`}
      alt=""
      className={base}
      loading="lazy"
    />
  );
}
