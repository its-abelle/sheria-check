import { SearchX, FileQuestion, WifiOff, MapPin } from "lucide-react";

interface EmptyStateProps {
  variant: "no-results" | "no-offenses" | "offline" | "coming-soon";
  query?: string;
}

export function EmptyState({ variant, query }: EmptyStateProps) {
  const config = {
    "no-results": {
      icon: SearchX,
      title: "No offenses found",
      description: query
        ? `We couldn't find anything matching "${query}". Try a different word like "speeding", "overtaking", or "license".`
        : "Try typing an offense name or select a category below.",
      action: "Not sure what to search? Try common ones like speeding, parking, or insurance.",
    },
    "no-offenses": {
      icon: FileQuestion,
      title: "No offenses here yet",
      description: "This category doesn't have any offenses listed yet. We're still compiling data from the Traffic Act.",
      action: "Check back soon as we continue adding more offenses.",
    },
    offline: {
      icon: WifiOff,
      title: "You're offline",
      description: "You need an internet connection to search offenses. Previously viewed offenses may still be available.",
      action: "Connect to the internet and try again.",
    },
    "coming-soon": {
      icon: MapPin,
      title: "Coming soon",
      description: "We're working on adding more features and data to Sheria Check.",
      action: "Follow our progress and updates.",
    },
  };

  const c = config[variant];
  const Icon = c.icon;

  return (
    <div className="flex flex-col items-center px-4 py-12 text-center" role="status">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-gray-700">{c.title}</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{c.description}</p>
      <p className="mt-3 text-xs text-gray-400">{c.action}</p>
    </div>
  );
}
