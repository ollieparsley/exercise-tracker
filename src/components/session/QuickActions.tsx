import { Button } from "@/components/ui/Button";

interface QuickActionsProps {
  onAdd: (amount: number) => void;
  disabled?: boolean;
}

export function QuickActions({ onAdd, disabled }: QuickActionsProps) {
  const actions = [
    { label: "-10", value: -10 },
    { label: "-1", value: -1 },
    { label: "+1", value: 1 },
    { label: "+10", value: 10 },
  ];

  return (
    <div className="flex gap-2" role="group" aria-label="Quick add buttons">
      {actions.map(({ label, value }) => (
        <Button
          key={value}
          variant={value > 0 ? "primary" : "secondary"}
          size="icon"
          onClick={() => onAdd(value)}
          disabled={disabled}
          aria-label={`${value > 0 ? "Add" : "Remove"} ${Math.abs(value)}`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
