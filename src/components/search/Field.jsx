// Labelled field layout and read-only input used on the search page.

export const INPUT_CLASS =
  "bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition";

export const Field = ({ label, hidden = false, children }) => (
  <div className={`flex flex-col gap-1 ${hidden ? "hidden" : ""}`}>
    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">{label}</label>
    {children}
  </div>
);

/** Read-only value with an optional description underneath. */
export const ReadOnlyField = ({ label, value, hint, hidden }) => (
  <Field label={label} hidden={hidden}>
    <input type="text" value={value} readOnly className={INPUT_CLASS} />
    {value !== "" && hint && <p className="text-xs text-emerald-900 dark:text-white mt-1">{hint}</p>}
  </Field>
);
