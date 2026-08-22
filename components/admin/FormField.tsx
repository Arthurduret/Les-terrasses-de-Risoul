interface FormFieldProps {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  step?: string;
  placeholder?: string;
}

export function FormField({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  step,
  placeholder,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="block text-sm text-mist-400">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-1.5 w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground focus:border-wood-500 focus:outline-none"
      />
    </label>
  );
}
