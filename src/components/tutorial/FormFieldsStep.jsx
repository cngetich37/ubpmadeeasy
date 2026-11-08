import { useState } from "react";
import StepCard, { FieldError, TUTORIAL_INPUT_CLASS } from "./StepCard";

/**
 * A step made of required text fields (business details, contacts). The help
 * text for a field appears while it has focus.
 */
const FormFieldsStep = ({ title, explanation, fields, values, errors, onChange }) => {
  const [focusedField, setFocusedField] = useState("");
  return (
    <StepCard title={title} explanation={explanation}>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
        {fields.map(([key, label, help, type = "text"]) => (
          <div key={key} className="flex flex-col">
            {focusedField === key && (
              <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{help}</span>
            )}
            <label className="text-md text-emerald-900 dark:text-white font-medium">{label}</label>
            <input
              type={type}
              value={values[key] || ""}
              onFocus={() => setFocusedField(key)}
              onBlur={() => setFocusedField("")}
              onChange={(e) => onChange(key, e.target.value)}
              className={TUTORIAL_INPUT_CLASS}
            />
            <FieldError message={errors[key]} />
          </div>
        ))}
      </form>
    </StepCard>
  );
};

export default FormFieldsStep;
