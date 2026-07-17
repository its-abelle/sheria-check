import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export function LoadingSpinner({ text = "Loading...", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-12 text-gray-500", className)}>
      <Loader2 className="h-5 w-5 animate-spin" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
