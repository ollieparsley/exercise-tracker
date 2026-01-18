import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TypeEditor } from "./TypeEditor";
import { useApp } from "@/hooks/useApp";
import type { ExerciseType } from "@/types";

export function TypeManager() {
  const { state, dispatch } = useApp();
  const [editingType, setEditingType] = useState<ExerciseType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const activeTypes = state.types.filter((t) => !t.isArchived);
  const archivedTypes = state.types.filter((t) => t.isArchived);

  const handleCreate = () => {
    setEditingType({
      id: uuidv4(),
      name: "",
      color: "#6290C3",
      isArchived: false,
    });
    setIsCreating(true);
  };

  const handleEdit = (type: ExerciseType) => {
    setEditingType({ ...type });
    setIsCreating(false);
  };

  const handleSave = (type: ExerciseType) => {
    if (isCreating) {
      dispatch({ type: "ADD_TYPE", payload: type });
    } else {
      dispatch({ type: "UPDATE_TYPE", payload: type });
    }
    setEditingType(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingType(null);
    setIsCreating(false);
  };

  const handleArchive = (typeId: string) => {
    dispatch({ type: "ARCHIVE_TYPE", payload: typeId });
  };

  if (editingType) {
    return (
      <TypeEditor
        type={editingType}
        onSave={handleSave}
        onCancel={handleCancel}
        isNew={isCreating}
      />
    );
  }

  return (
    <Card>
      <CardHeader>Exercise Types</CardHeader>

      <ul className="space-y-2 mb-4">
        {activeTypes.map((type) => (
          <li
            key={type.id}
            className="flex items-center justify-between py-2 border-b border-navy/10 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-navy">{type.name}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(type)}
              >
                Edit
              </Button>
              {activeTypes.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchive(type.id)}
                >
                  Archive
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Button onClick={handleCreate} variant="secondary" className="w-full">
        + Add Exercise Type
      </Button>

      {archivedTypes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-navy/10">
          <p className="text-navy/50 text-sm mb-2">
            Archived ({archivedTypes.length})
          </p>
          <ul className="space-y-1">
            {archivedTypes.map((type) => (
              <li
                key={type.id}
                className="flex items-center gap-2 text-navy/50 text-sm"
              >
                <div
                  className="w-3 h-3 opacity-50"
                  style={{ backgroundColor: type.color }}
                />
                {type.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
