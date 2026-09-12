import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTENT } from "../content";
import { audioQueue, type AudioItem } from "../domain/audioQueue";
import type { CardState } from "../domain/srs";
import type { Deck } from "../domain/types";
import { hasRussianVoice, hasSpanishVoice, speakUntilDone, stopSpeaking } from "../speech";

interface Props {
  deck: Deck;
  cards: Map<string, CardState>;
  onExit: () => void;
}

/** Gap after the Russian, before the Spanish is repeated. */
const SHORT_GAP_MS = 400;
/** Gap between one card and the next. */
const CARD_GAP_MS = 700;

/**
 * Hands-free listening.
 *
 * The point is that nobody is looking at it: this runs while its owner is
 * cooking or cleaning, so every choice here is about what happens in the ear,
 * not on the screen. Each card is a sandwich — Spanish, a pause long enough to
 * remember in, the Russian, then the Spanish once more so the last thing heard
 * is the sound being learned.
 *
 * The pause is the exercise. Without it this is a radio station: pleasant, and
 * gone by the end of the corridor.
 *
 * Nothing here touches the review schedule. Listening produces no evidence of
 * recall — there is no answer to be right or wrong about — and feeding it into
 * the intervals would push cards away on no grounds at all.
 */
export function Listen({ deck, cards, onExit }: Props) {
  const queue = useMemo(
    () => audioQueue(deck, CONTENT, cards, Date.now()),
    // Built once per visit on purpose: reshuffling mid-session because a card
    // changed elsewhere would move the ground underfoot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck],
  );

  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  /** Which half of the sandwich is being said, for the screen only. */
  const [showRu, setShowRu] = useState(false);
  const [pauseSeconds, setPauseSeconds] = useState(2.5);
  const [rate, setRate] = useState(0.9);

  const voicesReady = hasSpanishVoice() && hasRussianVoice();

  // Read by the loop, which is started once and must not close over stale
  // settings: moving a slider mid-session should take effect on the next card.
  const settingsRef = useRef({ pauseSeconds, rate });
  settingsRef.current = { pauseSeconds, rate };

  /** Aborts the current card's sequence — on pause, skip, or unmount. */
  const runRef = useRef<{ cancelled: boolean } | null>(null);
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  const stop = useCallback(() => {
    if (runRef.current) runRef.current.cancelled = true;
    runRef.current = null;
    stopSpeaking();
  }, []);

  /*
   * Keeps the screen awake while playing.
   *
   * Speech synthesis is killed when the tab stops being visible, so a screen
   * that sleeps ends the session. The lock is only available over HTTPS or on
   * localhost, which is why this is wrapped rather than assumed: over a plain
   * http address on the local network the request throws, and the honest
   * outcome is a warning on screen rather than a session that dies in a pocket
   * with no explanation.
   */
  const acquireWakeLock = useCallback(async () => {
    try {
      wakeRef.current = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch {
      wakeRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  }, []);

  // A lock is dropped by the browser whenever the page is hidden, so it has to
  // be taken again on return rather than assumed to have survived.
  useEffect(() => {
    if (!playing) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquireWakeLock();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [playing, acquireWakeLock]);

  useEffect(() => () => {
    stop();
    releaseWakeLock();
  }, [stop, releaseWakeLock]);

  /** Says one card, start to finish, unless cancelled part way. */
  const playCard = useCallback(
    async (item: AudioItem, run: { cancelled: boolean }) => {
      const wait = (ms: number) =>
        new Promise<void>((resolve) => window.setTimeout(resolve, ms));

      setShowRu(false);
      await speakUntilDone(item.es, "es", settingsRef.current.rate);
      if (run.cancelled) return;

      await wait(settingsRef.current.pauseSeconds * 1000);
      if (run.cancelled) return;

      setShowRu(true);
      await speakUntilDone(item.ru, "ru", settingsRef.current.rate);
      if (run.cancelled) return;

      await wait(SHORT_GAP_MS);
      if (run.cancelled) return;

      await speakUntilDone(item.es, "es", settingsRef.current.rate);
      if (run.cancelled) return;

      await wait(CARD_GAP_MS);
    },
    [],
  );

  /*
   * The loop.
   *
   * Driven by an effect on `index` rather than by a `for` loop over the queue:
   * that way skipping forward, pausing and reaching the end are all the same
   * thing — a change of index — instead of three ways to interrupt a running
   * loop. Reaching the end wraps to the start, since the session is meant to
   * outlast the chores.
   */
  useEffect(() => {
    if (!playing || queue.length === 0) return;
    const run = { cancelled: false };
    runRef.current = run;

    void (async () => {
      await playCard(queue[index % queue.length], run);
      if (!run.cancelled) setIndex((i) => (i + 1) % queue.length);
    })();

    return () => {
      run.cancelled = true;
      stopSpeaking();
    };
  }, [playing, index, queue, playCard]);

  const toggle = useCallback(() => {
    setPlaying((was) => {
      if (was) {
        stop();
        releaseWakeLock();
        return false;
      }
      void acquireWakeLock();
      return true;
    });
  }, [stop, acquireWakeLock, releaseWakeLock]);

  const step = useCallback(
    (delta: number) => {
      stop();
      setShowRu(false);
      setIndex((i) => (i + delta + queue.length) % queue.length);
      // A skip while paused only moves the marker; the loop restarts itself
      // when playing, because `index` is its trigger.
    },
    [stop, queue.length],
  );

  const item = queue.length > 0 ? queue[index % queue.length] : null;

  if (!voicesReady) {
    return (
      <div className="listen">
        <button className="back-link" onClick={onExit}>
          ← Назад
        </button>
        <p className="listen__warning">
          Для прослушивания нужны два голоса — испанский и русский.{" "}
          {hasSpanishVoice() ? "Русского" : "Испанского"} в системе нет. Windows: Параметры →
          Время и язык → Речь → Управление голосами. После установки полностью перезапусти
          браузер.
        </p>
      </div>
    );
  }

  return (
    <div className="listen">
      <div className="levels__top">
        <button className="levels__back" onClick={onExit} aria-label="Назад" title="Назад">
          ←
        </button>
        <h1 className="levels__title">{deck.title}</h1>
      </div>

      <div className="listen__card">
        <p className="listen__es">{item?.es ?? "—"}</p>
        {/* Held back until it is spoken, so a glance at the screen is not a
            spoiler for the pause that is still running. */}
        <p className={`listen__ru${showRu ? "" : " listen__ru--hidden"}`}>{item?.ru ?? ""}</p>
      </div>

      <div className="listen__controls">
        <button className="listen__step" onClick={() => step(-1)} aria-label="Предыдущее">
          ◀
        </button>
        <button
          className="listen__play"
          onClick={toggle}
          aria-label={playing ? "Пауза" : "Играть"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button className="listen__step" onClick={() => step(1)} aria-label="Следующее">
          ▶
        </button>
      </div>

      <p className="listen__position">
        {queue.length > 0 ? `${(index % queue.length) + 1} из ${queue.length}` : "Пусто"}
      </p>

      <label className="listen__slider">
        <span>Пауза на припоминание: {pauseSeconds.toFixed(1)} с</span>
        <input
          type="range"
          min={0.5}
          max={8}
          step={0.5}
          value={pauseSeconds}
          onChange={(event) => setPauseSeconds(Number(event.target.value))}
        />
      </label>

      <label className="listen__slider">
        <span>Скорость речи: {rate.toFixed(1)}×</span>
        <input
          type="range"
          min={0.5}
          max={1.4}
          step={0.1}
          value={rate}
          onChange={(event) => setRate(Number(event.target.value))}
        />
      </label>

      {playing && !wakeRef.current && (
        <p className="listen__warning">
          Экран удержать не удалось — браузер разрешает это только на защищённом соединении.
          Когда экран погаснет, речь оборвётся. На компьютере открывай через localhost.
        </p>
      )}

      <p className="listen__note">
        Прослушивание не влияет на расписание повторений: отвечать здесь нечего, и засчитывать
        нечего.
      </p>
    </div>
  );
}
