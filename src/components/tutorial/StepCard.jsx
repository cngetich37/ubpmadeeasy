// Card wrapper with the step title and its spoken explanation.
const StepCard = ({ title, explanation, children }) => (
  <div className="p-6 bg-gray-50 dark:bg-[var(--color-bg)] rounded-lg shadow-md">
    <h1 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4">{title}</h1>
    <p className="text-emerald-900 dark:text-white italic mb-4">{explanation}</p>
    {children}
  </div>
);

export const TUTORIAL_INPUT_CLASS =
  "input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]";

export const FieldError = ({ message }) =>
  message ? <span className="text-red-600 text-xs">{message}</span> : null;

export default StepCard;
