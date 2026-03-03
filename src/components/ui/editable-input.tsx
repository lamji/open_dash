"use client";

import * as React from "react";
import { Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
  className?: string;
  inputClassName?: string;
}

function EditableInput({
  value,
  onChange,
  label,
  placeholder,
  disabled: controlledDisabled,
  testId = "editable",
  className,
  inputClassName,
}: EditableInputProps) {
  const isControlled = controlledDisabled !== undefined;
  const [internalDisabled, setInternalDisabled] = React.useState(true);
  const isDisabled = isControlled ? controlledDisabled : internalDisabled;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();

  const handleEdit = () => {
    if (isControlled) return;
    setInternalDisabled(false);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const handleSave = () => {
    if (isControlled) return;
    setInternalDisabled(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleSave();
    }
  };

  return (
    <div className={cn("w-full max-w-xs space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          data-test-id={`${testId}-input`}
          className={cn(
            "pr-10 transition-all",
            isDisabled && "bg-muted/50 cursor-default",
            inputClassName
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={isDisabled ? handleEdit : handleSave}
          data-test-id={`${testId}-edit-btn`}
          className={cn(
            "absolute right-0 top-0 h-9 w-9 rounded-l-none",
            "text-muted-foreground hover:text-foreground transition-colors",
            !isDisabled && "text-primary hover:text-primary/80"
          )}
          tabIndex={-1}
        >
          {isDisabled ? <Pencil className="size-3.5" /> : <Check className="size-3.5" />}
          <span className="sr-only">{isDisabled ? "Edit" : "Save"}</span>
        </Button>
      </div>
    </div>
  );
}

export { EditableInput };
