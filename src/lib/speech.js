// Browser text-to-speech and speech recognition helpers.

const pickFemaleVoice = () =>
  window.speechSynthesis
    .getVoices()
    .find(
      (voice) =>
        voice.name.includes("Female") ||
        voice.name.includes("Zira") ||
        voice.name.includes("Google US English Female")
    );

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Read text aloud. Currency codes are spoken as "Kenya shillings". Returns false if unsupported. */
export function speak(text) {
  if (!canSpeak()) return false;
  const utterance = new window.SpeechSynthesisUtterance(
    text.replace(/KSH|KES/gi, "Kenya shillings")
  );
  utterance.lang = "en-US";
  const voice = pickFemaleVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}

const Recognition = () =>
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Listen for one spoken phrase. Returns false if the browser has no speech
 * recognition (e.g. Firefox).
 */
export function listenOnce({ onResult, onEnd, onError }) {
  const SpeechRecognition = Recognition();
  if (!SpeechRecognition) return false;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => onResult(event.results[0][0].transcript);
  recognition.onspeechend = () => {
    recognition.stop();
    onEnd?.();
  };
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    onError?.(event.error);
  };
  recognition.start();
  return true;
}
