import { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Helmet } from "react-helmet";
import { api } from "../lib/api";
import { readCache, writeCache } from "../lib/cache";
import { answerPrompt, composeReply } from "../lib/agent";
import { prepareSpeechText } from "../lib/agentParser";
import { createAgentPdfUrl } from "../lib/pdf";
import { listenOnce, speak } from "../lib/speech";
import { useApiError } from "../hooks/useApiError";
import { useChatSessions } from "../hooks/useChatSessions";
import ErrorBanner from "./common/ErrorBanner";
import ChatSidebar from "./agent/ChatSidebar";
import ChatMessages from "./agent/ChatMessages";
import ChatInput from "./agent/ChatInput";
import ExamplePrompts from "./agent/ExamplePrompts";

const TYPING_DELAY_MS = 50;

const readAloud = (text) => {
  if (!speak(prepareSpeechText(text))) {
    alert("Sorry, text-to-speech is not supported in your browser.");
  }
};

/** /agent: rule-based chat that answers business and advert fee questions. */
const UBPAgent = () => {
  const [prompt, setPrompt] = useState("");
  const [typing, setTyping] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activities, setActivities] = useState(() => readCache("naics:all") || []);
  const [advertTypes, setAdvertTypes] = useState([]);
  const { apiError, onError, clearError } = useApiError();
  const { sessions, currentSession, messages, setCurrentSession, addMessage, createSession, deleteSession } =
    useChatSessions();
  const chatContainerRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    api
      .adverts()
      .then((data) => setAdvertTypes(data.map((item) => item.advertType)))
      .catch(onError);
  }, [onError]);

  // Full business dataset for free-text matching (cached for a day).
  useEffect(() => {
    if (activities.length) return;
    api
      .allActivities()
      .then((data) => {
        setActivities(data);
        writeCache("naics:all", data);
      })
      .catch(onError);
  }, [activities.length, onError]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sessions, typing]);

  useEffect(() => () => clearInterval(typingTimer.current), []);

  // Reveal the reply one character at a time, then commit it to the session.
  const simulateTyping = (text, onDone) => {
    clearInterval(typingTimer.current);
    let index = 0;
    setTyping("");
    typingTimer.current = setInterval(() => {
      index += 1;
      setTyping(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(typingTimer.current);
        setTyping("");
        onDone();
      }
    }, TYPING_DELAY_MS);
  };

  const handleSendPrompt = async (inputPrompt = prompt) => {
    if (!inputPrompt.trim()) return;
    const session = currentSession;
    addMessage(session, { role: "user", text: inputPrompt });

    try {
      const answer = await answerPrompt(inputPrompt, { activities, advertTypes });
      if (answer.business || answer.advert) {
        const text = composeReply(answer);
        const pdf = await createAgentPdfUrl(answer);
        simulateTyping(text, () => {
          addMessage(session, { role: "assistant", text, pdf });
          readAloud(text);
        });
        return;
      }
      addMessage(session, {
        role: "assistant",
        text: answer.errorMessage || "I am sorry, I didn't understand you.",
      });
    } catch (error) {
      console.error("Unexpected error in handleSendPrompt:", error);
      addMessage(session, {
        role: "assistant",
        text: "An unexpected error occurred. Please try again or check the console for details.",
      });
    }
  };

  const handleVoiceInput = () => {
    const started = listenOnce({
      onResult: (speech) => {
        setPrompt(speech);
        handleSendPrompt(speech);
      },
      onEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });
    if (started) setIsListening(true);
    else alert("Sorry, voice input is not supported in your browser.");
  };

  const handleReadLast = () => {
    if (messages.length) readAloud(messages[messages.length - 1].text);
  };

  return (
    <>
      <Helmet>
        <title>UBP Made Easy - Streamline UBP</title>
        <meta
          name="description"
          content="Get accurate finance act estimates based on your industry and size. Powered by AI, UBP Assistant helps businesses with business activity search."
        />
        <meta
          name="keywords"
          content="Business permit, AI Business Assistant, Business charges Estimation, Financial Act Planning"
        />
      </Helmet>
      <div className="flex flex-col md:flex-row h-screen bg-[#F5F5F5] dark:bg-[var(--color-bg)] p-4 gap-4">
        <button
          className="md:hidden p-2 bg-emerald-900 text-white rounded-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle chat list"
        >
          <FiMenu className="text-lg" />
        </button>

        <ChatSidebar
          sessions={sessions}
          open={isSidebarOpen}
          onCreate={() => {
            createSession();
            setIsSidebarOpen(false);
          }}
          onSelect={(session) => {
            setCurrentSession(session);
            setIsSidebarOpen(false);
          }}
          onDelete={deleteSession}
        />

        <div className="flex-1 flex flex-col bg-white dark:bg-[var(--color-surface)] rounded-lg shadow-lg overflow-hidden">
          <header className="bg-emerald-900 p-4">
            <h1 className="text-2xl font-bold text-center text-white">
              <span className="text-[#FFD700]">UBP</span>Agent
            </h1>
          </header>
          <ChatMessages ref={chatContainerRef} messages={messages} typing={typing}>
            <ErrorBanner message={apiError} onDismiss={clearError} />
          </ChatMessages>
          <ChatInput
            value={prompt}
            onChange={setPrompt}
            onSend={() => handleSendPrompt()}
            onVoice={handleVoiceInput}
            onReadAloud={handleReadLast}
            isListening={isListening}
          />
          <ExamplePrompts onPick={(example) => handleSendPrompt(example)} />
        </div>
      </div>
    </>
  );
};

export default UBPAgent;
