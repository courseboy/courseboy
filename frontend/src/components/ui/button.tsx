import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "xl";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            // Variants
            "bg-primary text-white shadow-md hover:scale-105 hover:bg-primary-hover":
              variant === "primary",
            "bg-secondary/20 text-teal-700 hover:bg-secondary/30":
              variant === "secondary",
            "border-2 border-primary/20 bg-white text-primary hover:bg-primary/5":
              variant === "outline",
            "bg-transparent text-text-secondary hover:bg-gray-100 hover:text-primary":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "bg-accent text-white shadow-lg hover:scale-105 hover:bg-accent/90":
              variant === "accent",
            // Sizes
            "h-10 px-4 text-base": size === "sm",
            "h-12 px-6 text-lg": size === "md",
            "h-14 px-8 text-xl": size === "lg",
            "h-16 px-8 text-xl": size === "xl",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
