import { rangeOptions, type ChartRange } from "@/lib/timeRange";

interface TimeRangeSelectorProps {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Time range">
      {rangeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-2 py-1 text-xs font-medium transition-colors
            ${
              value === option.value
                ? "bg-blue text-cream"
                : "bg-mint text-navy/70 hover:text-navy"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
