const EXAMPLES = [
  "Business charges for MPESA with 5 outlets?",
  "Above canopy with 2 sides?",
  "Under canopy 1m by 2m, 2 sides",
  "Food storage with 1000 sq.m?",
];

/** Clickable example prompts under the chat. */
const ExamplePrompts = ({ onPick }) => (
  <div className="p-4 bg-gray-50 dark:bg-[var(--color-surface)]">
    <h2 className="text-lg font-bold text-emerald-900 dark:text-white mb-2">Example Prompts:</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {EXAMPLES.map((example) => (
        <button
          key={example}
          className="p-2 bg-emerald-900 text-white dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)] rounded-lg hover:bg-[#05482D] dark:hover:bg-yellow-300 transition-colors text-sm text-left"
          onClick={() => onPick(example)}
        >
          {example}
        </button>
      ))}
    </div>
  </div>
);

export default ExamplePrompts;
