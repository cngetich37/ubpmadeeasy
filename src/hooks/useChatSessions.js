import { useCallback, useEffect, useState } from "react";

const SESSIONS_KEY = "ubpai_sessions";
const CURRENT_KEY = "ubpai_currentSession";

const loadSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || { "Chat 1": [] };
  } catch {
    return { "Chat 1": [] };
  }
};

const loadCurrent = () => {
  try {
    return localStorage.getItem(CURRENT_KEY) || "Chat 1";
  } catch {
    return "Chat 1";
  }
};

/** Agent chat sessions, persisted to localStorage. */
export function useChatSessions() {
  const [sessions, setSessions] = useState(loadSessions);
  const [currentSession, setCurrentSession] = useState(loadCurrent);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      // storage unavailable; history just won't persist
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_KEY, currentSession);
    } catch {
      // ignore
    }
  }, [currentSession]);

  /** Append a message to a session (pass the session explicitly: replies arrive later). */
  const addMessage = useCallback((session, message) => {
    setSessions((prev) => ({ ...prev, [session]: [...(prev[session] || []), message] }));
  }, []);

  const createSession = () => {
    const name = `Chat ${Object.keys(sessions).length + 1}`;
    setSessions((prev) => ({ ...prev, [name]: [] }));
    setCurrentSession(name);
  };

  const deleteSession = (session) => {
    const remaining = { ...sessions };
    delete remaining[session];
    setSessions(remaining);
    if (currentSession === session) {
      setCurrentSession(Object.keys(remaining)[0] || "Chat 1");
    }
  };

  return {
    sessions,
    currentSession,
    messages: sessions[currentSession] || [],
    setCurrentSession,
    addMessage,
    createSession,
    deleteSession,
  };
}
