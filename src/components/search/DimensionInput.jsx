import { Field, INPUT_CLASS } from "./Field";

const STEP_BUTTON = "px-1 py-0 rounded-md cursor-pointer text-xs text-[#FFD700] bg-emerald-900";

/**
 * Whole-metre input with ▲/▼ steppers. Arrow keys step too; clearing the field
 * leaves it empty ("") until a number is typed.
 */
const DimensionInput = ({ label, value, onChange }) => {
  const increment = () => onChange((prev) => (Number(prev) || 0) + 1);
  const decrement = () => {
    if (value > 0) onChange((prev) => prev - 1);
  };

  return (
    <Field label={label}>
      <div className="relative">
        <input
          type="text"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (!isNaN(parsed) && parsed >= 0) onChange(parsed);
            else if (e.target.value === "") onChange("");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") increment();
            else if (e.key === "ArrowDown") decrement();
            else if (e.key === "Backspace") onChange("");
          }}
          className={`${INPUT_CLASS} w-full`}
        />
        <div className="absolute top-2 right-2 bottom-2 flex flex-col">
          <div className="flex justify-center w-full">
            <kbd className={STEP_BUTTON} onClick={increment}>
              ▲
            </kbd>
          </div>
          <div className="flex justify-center w-full">
            <kbd className={STEP_BUTTON} onClick={decrement}>
              ▼
            </kbd>
          </div>
        </div>
      </div>
    </Field>
  );
};

export default DimensionInput;
