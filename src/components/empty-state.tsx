interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white/50 p-8 text-center">
      <p className="font-['Space_Grotesk'] text-xl font-semibold text-slate-900">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
