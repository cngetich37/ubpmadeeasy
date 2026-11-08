import StepCard, { TUTORIAL_INPUT_CLASS } from "./StepCard";

const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-emerald-900 dark:text-white font-medium mb-2">{label}</label>
    <select className={TUTORIAL_INPUT_CLASS} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select...</option>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  </div>
);

/** Step 1: application type and business nature. */
const ApplicationTypeStep = ({ explanation, formData, setFormData }) => (
  <StepCard title="Application Type" explanation={explanation}>
    <SelectField
      label="Application Type"
      value={formData.applicationType}
      onChange={(applicationType) => setFormData((f) => ({ ...f, applicationType }))}
      options={[
        ["new", "New"],
        ["renewal", "Renewal"],
      ]}
    />
    <SelectField
      label="Business Nature"
      value={formData.businessNature}
      onChange={(businessNature) => setFormData((f) => ({ ...f, businessNature }))}
      options={[
        ["registered", "Registered/Formal"],
        ["unregistered", "Unregistered/Informal"],
      ]}
    />
  </StepCard>
);

export default ApplicationTypeStep;
