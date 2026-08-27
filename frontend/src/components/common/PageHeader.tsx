type PageHeaderProps = {
  title: string;
  description: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-ink-200/70 bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <h1 className="font-display text-2xl font-700 tracking-tight text-ink-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-ink-500">{description}</p>
    </div>
  );
}
