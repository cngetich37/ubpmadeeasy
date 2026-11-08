import { FiPlus, FiTrash } from "react-icons/fi";

/** List of chat sessions with "New Chat" and delete. Hidden on mobile unless `open`. */
const ChatSidebar = ({ sessions, open, onCreate, onSelect, onDelete }) => (
  <div
    className={`${
      open ? "block" : "hidden"
    } md:block w-full md:w-1/4 bg-white dark:bg-[var(--color-surface)] p-4 rounded-lg shadow-lg`}
  >
    <h2 className="text-xl font-bold text-emerald-900 dark:text-white mb-4">Chats</h2>
    <button
      className="w-full bg-emerald-900 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#05482D] transition-colors"
      onClick={onCreate}
    >
      <FiPlus className="text-lg" /> New Chat
    </button>
    <div className="mt-4 space-y-2">
      {Object.keys(sessions).map((session) => (
        <div
          key={session}
          className="flex justify-between items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <span className="text-emerald-900" onClick={() => onSelect(session)}>
            {session}
          </span>
          <FiTrash
            className="text-red-500 hover:text-red-600 cursor-pointer"
            onClick={() => onDelete(session)}
          />
        </div>
      ))}
    </div>
  </div>
);

export default ChatSidebar;
