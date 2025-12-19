import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-gray-200 border-t-primary",
        {
          "h-6 w-6 border-2": size === "sm",
          "h-10 w-10": size === "md",
          "h-16 w-16": size === "lg",
        },
        className
      )}
    />
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 bg-background-light">
      <Spinner size="lg" />
      <p className="text-lg text-text-secondary">Loading...</p>
    </div>
  );
}
