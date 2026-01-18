import { type ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CountInputProps {
  onSubmit: (count: number) => void;
  disabled?: boolean;
}

export function CountInput({ onSubmit, disabled }: CountInputProps) {
  const [value, setValue] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow positive integers
    if (val === "" || /^\d+$/.test(val)) {
      setValue(val);
    }
  };

  const handleSubmit = () => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0) {
      onSubmit(count);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter count"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Exercise count"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={disabled || !value || parseInt(value, 10) <= 0}
      >
        Log
      </Button>
    </div>
  );
}
