import { cn } from "@/lib/utils";

interface PillProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "solid";
}

export default function Pill({ children, className, variant = "default" }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200",
        variant === "default"
          ? "border border-hairline bg-white/4 text-text-secondary"
          : "bg-white/12 text-white border border-white/20",
        className,
      )}
    >
      {children}
    </span>
  );
}
