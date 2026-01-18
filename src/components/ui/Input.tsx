import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-navy text-sm font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2
            bg-cream border border-navy/30
            text-navy placeholder:text-navy/50
            focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue
            disabled:opacity-50 disabled:cursor-not-allowed
            [&::-webkit-calendar-picker-indicator]:opacity-70
            [&::-webkit-calendar-picker-indicator]:hover:opacity-100
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            ${error ? "border-coral-red" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-coral-red text-sm">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
