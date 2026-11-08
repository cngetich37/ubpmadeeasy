import { FiMic, FiSend } from "react-icons/fi";
import { GiSpeaker } from "react-icons/gi";

/** Prompt box with send, voice input and read-last-reply buttons. */
const ChatInput = ({ value, onChange, onSend, onVoice, onReadAloud, isListening }) => (
  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        className="flex-1 p-2 border border-emerald-900 dark:border-[var(--color-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[var(--color-primary)] bg-white dark:bg-[var(--color-surface)] text-emerald-900 dark:text-[var(--color-text)]"
        placeholder="Enter your prompt..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <div className="flex gap-2">
        <button
          className="bg-emerald-900 text-white p-2 rounded-lg hover:bg-[#05482D] transition-colors"
          onClick={onSend}
          aria-label="Send"
        >
          <FiSend className="text-lg" />
        </button>
        <button
          className={`${
            isListening ? "bg-emerald-900" : "bg-[#FFD700]"
          } text-emerald-900 p-2 rounded-lg hover:bg-[#E6B800] transition-colors`}
          onClick={onVoice}
          aria-label="Speak your prompt"
        >
          <FiMic className="text-lg" />
        </button>
        <button
          onClick={onReadAloud}
          className="bg-emerald-900 text-[#FFD700] p-2 rounded-lg hover:bg-[#05482D] transition-colors"
          aria-label="Read the last reply aloud"
        >
          <GiSpeaker className="text-lg" />
        </button>
      </div>
    </div>
    <p className="text-sm text-emerald-900 dark:text-white text-center mt-2 italic">
      UBPAgent can make mistakes. Please consult the Finance Act.
    </p>
  </div>
);

export default ChatInput;
