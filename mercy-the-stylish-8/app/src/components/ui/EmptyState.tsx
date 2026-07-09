export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center px-8 py-16 text-center">
      <p className="font-serif text-2xl text-plum">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
