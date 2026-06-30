export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
      {children}
    </div>
  );
}
