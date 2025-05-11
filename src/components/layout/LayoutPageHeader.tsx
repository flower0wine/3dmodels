interface LayoutPageHeaderProps {
  title: string;
  description: string;
}

export default function LayoutPageHeader({ title, description }: LayoutPageHeaderProps) {
  return (
    <header className="mb-12 text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        {description}
      </p>
    </header>
  );
} 