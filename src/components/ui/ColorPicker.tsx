import { type InputHTMLAttributes, forwardRef } from "react";

interface ColorPickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ className = "", label, id, value, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-navy text-sm font-medium">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 border border-navy/30 flex-shrink-0"
            style={{ backgroundColor: value as string }}
          />
          <input
            ref={ref}
            id={inputId}
            type="color"
            value={value}
            className={`
              w-full h-11 cursor-pointer
              bg-transparent border-0
              [&::-webkit-color-swatch-wrapper]:p-0
              [&::-webkit-color-swatch]:border-navy/30
              [&::-webkit-color-swatch]:border
              ${className}
            `}
            {...props}
          />
        </div>
      </div>
    );
  }
);

ColorPicker.displayName = "ColorPicker";
