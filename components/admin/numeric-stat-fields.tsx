import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field = {
  key: string;
  label: string;
};

type NumericStatFieldsProps = {
  fields: readonly Field[];
  values?: Record<string, number | null | undefined>;
};

export function NumericStatFields({ fields, values = {} }: NumericStatFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {fields.map((field) => (
        <div className="space-y-2" key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            name={field.key}
            type="number"
            min={0}
            defaultValue={values[field.key] ?? 0}
            required={field.key === "minutesPlayed"}
          />
        </div>
      ))}
    </div>
  );
}
