import { useState, type ChangeEvent } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Button } from "@/components/ui/Button";
import type { ExerciseType } from "@/types";

interface TypeEditorProps {
  type: ExerciseType;
  onSave: (type: ExerciseType) => void;
  onCancel: () => void;
  isNew?: boolean;
}

export function TypeEditor({ type, onSave, onCancel, isNew }: TypeEditorProps) {
  const [name, setName] = useState(type.name);
  const [color, setColor] = useState(type.color);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value.toUpperCase());
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        ...type,
        name: name.trim(),
        color,
      });
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        {isNew ? "New Exercise Type" : "Edit Exercise Type"}
      </CardHeader>

      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g., Push-ups"
        />

        <ColorPicker label="Color" value={color} onChange={handleColorChange} />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid} className="flex-1">
            {isNew ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
