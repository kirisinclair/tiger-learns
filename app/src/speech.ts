/**
 * Spanish text-to-speech.
 *
 * The platform synthesiser is free, works offline and ships no audio files, but
 * it will happily read Spanish with a Russian voice if no Spanish one is
 * installed — which sounds wrong enough to teach the wrong pronunciation. So a
 * Spanish voice is required: when none is present the app stays silent and says
 * how to install one instead.
 */

/** Locale preference, Latin America first, then Spain, then anything Spanish. */
const LOCALE_PRIORITY = [
  "es-mx",
  "es-us",
  "es-419",
  "es-co",
  "es-ar",
  "es-cl",
  "es-pe",
  "es-ve",
  "es-es",
  "es",
];

/**
 * Russian, for the audio drill.
 *
 * The rule that keeps the app silent without a Spanish voice does not apply
 * in reverse: a Spanish voice reading Russian is only comical, not
 * mis-teaching, and the drill is useless without the translation anyway. So
 * Russian is required for listening mode and irrelevant everywhere else.
 */
const RU_LOCALE_PRIORITY = ["ru-ru", "ru"];

let resolved: SpeechSynthesisVoice | null = null;
let resolvedRu: SpeechSynthesisVoice | null = null;
const listeners = new Set<() => void>();

function normalizeLang(lang: string): string {
  return lang.replace("_", "-").toLowerCase();
}

/** Neural voices ("Natural", "Online") sound markedly better than SAPI ones. */
function qualityBonus(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  if (name.includes("natural")) return 2;
  if (name.includes("online")) return 1;
  return 0;
}

function findSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const spanish = window.speechSynthesis
    .getVoices()
    .filter((voice) => normalizeLang(voice.lang).startsWith("es"));

  if (spanish.length === 0) return null;

  // Lowest locale index wins; quality breaks ties.
  return spanish.reduce((best, voice) => {
    const score = (candidate: SpeechSynthesisVoice) => {
      const lang = normalizeLang(candidate.lang);
      const index = LOCALE_PRIORITY.findIndex((locale) => lang.startsWith(locale));
      return (index === -1 ? LOCALE_PRIORITY.length : index) * 10 - qualityBonus(candidate);
    };
    return score(voice) < score(best) ? voice : best;
  });
}

/**
 * Re-reads the voice list and tells anyone listening if it changed.
 * Exported so the UI can offer a manual re-check: voices installed while the
 * browser was already running do not always show up on their own.
 */
export function recheckVoices(): void {
  refresh();
}

function findRussianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const russian = window.speechSynthesis
    .getVoices()
    .filter((voice) => normalizeLang(voice.lang).startsWith("ru"));
  if (russian.length === 0) return null;
  return russian.reduce((best, voice) => {
    const score = (candidate: SpeechSynthesisVoice) => {
      const lang = normalizeLang(candidate.lang);
      const index = RU_LOCALE_PRIORITY.findIndex((locale) => lang.startsWith(locale));
      return (index === -1 ? RU_LOCALE_PRIORITY.length : index) * 10 - qualityBonus(candidate);
    };
    return score(voice) < score(best) ? voice : best;
  });
}

function refresh(): void {
  const found = findSpanishVoice();
  const foundRu = findRussianVoice();
  if (found === resolved && foundRu === resolvedRu) return;
  resolved = found;
  resolvedRu = foundRu;
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refresh();
  // Chrome, Edge and Android populate the voice list asynchronously.
  window.speechSynthesis.addEventListener("voiceschanged", refresh);
  // Some browsers never fire the event at all, and others fire it before the
  // page has finished mounting. A couple of cheap re-checks close both gaps.
  for (const delay of [200, 800, 2000]) {
    setTimeout(refresh, delay);
  }
}

/** True once a Spanish voice is available on this device. */
export function hasSpanishVoice(): boolean {
  if (!resolved) refresh();
  return resolved !== null;
}

/** True once a Russian voice is available — required by listening mode. */
export function hasRussianVoice(): boolean {
  if (!resolvedRu) refresh();
  return resolvedRu !== null;
}

/** Notifies when voices finish loading, so the UI can drop the warning. */
export function onVoicesChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Speaks Spanish text. Does nothing when no Spanish voice exists — a Russian
 * voice reading Spanish is worse than silence.
 */
export function speak(text: string, rate = 0.9): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!resolved) refresh();
  if (!resolved) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = resolved;
  utterance.lang = resolved.lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

/**
 * Speaks one phrase and resolves when it has actually finished.
 *
 * `speak` above is fire-and-forget, which is right for a single word after an
 * answer but useless for a sequence: without knowing when a phrase ends there
 * is no way to leave a pause after it. This resolves on `end`, and also on
 * `error` — a synthesiser that fails on one item must not stall the whole
 * session.
 *
 * A stalled `end` event is a real hazard: browsers drop it often enough that
 * a queue built on it alone will silently hang forever. The timeout is the
 * floor under that — generous enough never to cut speech short, short enough
 * that a lost event costs one gap rather than the session.
 */
export function speakUntilDone(text: string, lang: "es" | "ru", rate = 0.9): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve();
  if (!resolved || !resolvedRu) refresh();
  const voice = lang === "es" ? resolved : resolvedRu;
  if (!voice) return Promise.resolve();

  return new Promise((done) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = rate;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      pending.delete(utterance);
      done();
    };

    // Roughly how long the text can take, plus slack.
    const estimate = 1500 + (text.length / Math.max(0.5, rate)) * 130;
    const timer = window.setTimeout(finish, estimate);

    utterance.onend = finish;
    utterance.onerror = finish;
    // Held until it fires: an utterance collected mid-speech goes silent in
    // some browsers, and its events never arrive.
    pending.add(utterance);
    window.speechSynthesis.speak(utterance);
  });
}

/** Live utterances, kept from being garbage-collected while speaking. */
const pending = new Set<SpeechSynthesisUtterance>();

/** Stops whatever is being said and clears anything queued behind it. */
export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  pending.clear();
}

/** Every voice the browser reports, for the in-app diagnostic. */
export function listVoices(): Array<{ name: string; lang: string; spanish: boolean }> {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().map((voice) => ({
    name: voice.name,
    lang: voice.lang,
    spanish: normalizeLang(voice.lang).startsWith("es"),
  }));
}

/** The Spanish voice currently in use, if any. */
export function currentVoiceName(): string | null {
  return resolved?.name ?? null;
}

/** Shown when the device has no Spanish voice. */
export const NO_VOICE_HINT =
  "Испанского голоса нет в системе, поэтому озвучка молчит — русский голос читал бы испанский " +
  "неправильно. Windows: Параметры → Время и язык → Речь → Управление голосами → Добавить голоса → " +
  "Español (México). Потом полностью перезапусти браузер. Если Chrome голос не увидит, открой " +
  "приложение в Microsoft Edge: там есть онлайн-голоса Natural без установки. " +
  "Android: Настройки → Система → Языки и ввод → Синтез речи → загрузить испанский.";
