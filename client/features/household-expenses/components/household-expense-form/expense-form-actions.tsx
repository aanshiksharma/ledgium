import { Button } from "@/components/ui/button";

type Props = {
  isSubmitting: boolean;
  onCancel?: () => void;
  submitLabel: string;
};

export function ExpenseFormActions({
  isSubmitting,
  onCancel,
  submitLabel,
}: Props) {
  return (
    <div className="flex justify-end gap-3">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}
