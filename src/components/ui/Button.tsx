import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue text-cream hover:bg-blue/90 active:bg-blue/80",
  secondary:
    "border border-navy text-navy hover:bg-navy/10 active:bg-navy/20",
  destructive:
    "bg-coral-red text-white hover:bg-coral-red/90 active:bg-coral-red/80",
  ghost: "text-navy hover:bg-navy/10 active:bg-navy/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  icon: "w-11 h-11 p-0", // 44px touch target
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue
          disabled:opacity-50 disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
