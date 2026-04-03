import { useState } from "react";

const KEYS = {
  personality: "tracker_commentator_personality",
  voice: "tracker_commentator_voice",
  enabled: "tracker_commentator_enabled",
};

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // eslint-disable-next-line no-empty
  }
}

export default function useCommentatorSettings() {
  const [personality, setPersonalityState] = useState(() => load(KEYS.personality, "dramatic"));
  const [voice, setVoiceState] = useState(() => load(KEYS.voice, null));
  const [enabled, setEnabledState] = useState(() => load(KEYS.enabled, true));

  const setPersonality = (v) => { save(KEYS.personality, v); setPersonalityState(v); };
  const setVoice = (v) => { save(KEYS.voice, v); setVoiceState(v); };
  const setEnabled = (v) => { save(KEYS.enabled, v); setEnabledState(v); };

  return { personality, voice, enabled, setPersonality, setVoice, setEnabled };
}
