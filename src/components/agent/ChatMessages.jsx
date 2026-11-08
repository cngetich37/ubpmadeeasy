import { forwardRef } from "react";
import { motion } from "framer-motion";

const ASSISTANT_BUBBLE =
  "bg-emerald-900 text-white dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)]";

/** Scrollable message list, plus the in-progress "typing" reply. */
const ChatMessages = forwardRef(function ChatMessages({ messages, typing, children }, ref) {
  return (
    <div ref={ref} className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-[var(--color-surface)]">
      {children}
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === "user" ? "bg-[#FFD700] text-emerald-900" : ASSISTANT_BUBBLE
            }`}
          >
            {message.text}
            {message.pdf && (
              <div className="mt-2">
                <a
                  href={message.pdf}
                  download="UBP_Advert_Combined.pdf"
                  className="inline-block bg-[#FFD700] text-emerald-900 px-3 py-1 rounded hover:bg-emerald-900 hover:text-[#FFD700] transition-colors font-semibold text-sm"
                >
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </motion.div>
      ))}
      {typing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-start"
        >
          <div className={`max-w-[80%] p-3 rounded-lg ${ASSISTANT_BUBBLE}`}>{typing}</div>
        </motion.div>
      )}
    </div>
  );
});

export default ChatMessages;
