import { useApp } from "@/hooks/useApp";
import type { ExerciseType } from "@/types";

interface TypeSelectorProps {
  selectedTypeId: string;
  onSelect: (typeId: string) => void;
}

export function TypeSelector({ selectedTypeId, onSelect }: TypeSelectorProps) {
  const { state } = useApp();
  const activeTypes = state.types.filter((t) => !t.isArchived);

  return (
    <div
      role="radiogroup"
      aria-label="Exercise type"
      className="flex flex-wrap gap-2"
    >
      {activeTypes.map((type: ExerciseType) => {
        const isSelected = type.id === selectedTypeId;
        return (
          <button
            key={type.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(type.id)}
            className={`
              min-w-[44px] h-11 px-4
              font-medium text-sm
              transition-colors
              border
              ${
                isSelected
                  ? "border-transparent"
                  : "border-navy/40 text-navy hover:border-navy"
              }
            `}
            style={
              isSelected
                ? { backgroundColor: type.color, color: "#1a1b41" }
                : undefined
            }
          >
            {type.name}
          </button>
        );
      })}
    </div>
  );
}
