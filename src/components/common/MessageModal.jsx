// Centered modal with a title, a message and a Close button.
const MessageModal = ({ title, message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white dark:bg-[var(--color-surface)] w-11/12 max-w-md rounded-2xl shadow-2xl p-8 relative border-2 border-[#FFD700] dark:border-[var(--color-primary)]">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-emerald-900 dark:text-[var(--color-primary)] font-bold text-2xl hover:text-yellow-500 dark:hover:text-yellow-300 transition"
        aria-label="Close modal"
      >
        ✕
      </button>
      <h2 className="text-emerald-900 dark:text-[var(--color-primary)] font-extrabold text-2xl mb-4 text-center">
        {title}
      </h2>
      <p className="text-lg text-red-500 dark:text-white text-center font-semibold mb-4">{message}</p>
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="bg-emerald-900 dark:bg-[var(--color-primary)] text-[#FFD700] dark:text-[var(--color-bg)] font-bold py-2 px-6 rounded-full shadow hover:bg-emerald-800 dark:hover:bg-yellow-300 hover:text-yellow-300 dark:hover:text-[var(--color-bg)] transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default MessageModal;
