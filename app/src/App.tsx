import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTENT } from "./content";
import {
  NO_VOICE_HINT,
  hasSpanishVoice,
  listVoices,
  onVoicesChanged,
  recheckVoices,
} from "./speech";
import { getCardOrNew, review, type CardState, type Grade } from "./domain/srs";
import type { Deck } from "./domain/types";
import {
  exportProgress,
  importProgress,
  isoDay,
  loadCards,
  DEFAULT_SETTINGS,
  loadHistory,
  loadSettings,
  loadStats,
  recordDay,
  recordReview,
  saveCards,
  saveHistory,
  saveSettings,
  saveStats,
} from "./storage/progressStore";
import { isListenable } from "./domain/audioQueue";
import { deckBuckets, knownCount, type Buckets } from "./domain/progress";
import { isConjugationDeck } from "./domain/deckVerbs";
import { LevelPicker } from "./ui/LevelPicker";
import { Listen } from "./ui/Listen";
import { SettingsMenu } from "./ui/SettingsMenu";
import { VerbBrowser } from "./ui/VerbBrowser";
import { Practice } from "./ui/Practice";
import { Progress } from "./ui/Progress";

/**
 * Two top-level ideas, not four.
 *
 * `A1` and `A2` are the course: a level at a time, in order. `Словарь` is the
 * same pool of words reached another way — by frequency, by topic, or by how
 * they are going. Mixing a level with a selection principle in one row of tabs
 * was what made the old navigation impossible to reason about.
 */
const SECTIONS = [
  { id: "A1", title: "A1", tracks: ["grammar"] },
  { id: "A2", title: "A2", tracks: ["grammar"] },
  { id: "words", title: "Слова", tracks: ["frequency", "topics", "verbs", "state"] },
  { id: "phrases", title: "Фразы", tracks: ["phrases"] },
  // Not a pile of cards but a view of them: it has no tracks and no decks,
  // and the main area swaps to the progress screen instead of a deck list.
  { id: "progress", title: "Прогресс", tracks: [] },
] as const;

/** Sections that hold one shared pool rather than a stage of the course. */
const LEVELLESS_SECTIONS = new Set(["words", "phrases"]);

const TRACK_TITLES: Record<string, string> = {
  grammar: "Грамматика",
  frequency: "По частотности",
  topics: "По темам",
  verbs: "Глаголы",
  state: "По состоянию",
  phrases: "Фразы",
};

type SectionId = (typeof SECTIONS)[number]["id"];

/** A deck's standing, in the same three shades used everywhere else. */
function DeckBar({ buckets }: { buckets: Buckets }) {
  const width = (n: number) => `${(n / buckets.total) * 100}%`;
  return (
    <span
      className="bucket-bar deck-row__bar"
      role="img"
      aria-label={`знаю ${knownCount(buckets)} из ${buckets.total}`}
      title={`знаю ${knownCount(buckets)} из ${buckets.total}`}
    >
      <span className="bucket-bar__retired" style={{ width: width(buckets.retired) }} />
      <span className="bucket-bar__mature" style={{ width: width(buckets.mature) }} />
      <span className="bucket-bar__young" style={{ width: width(buckets.young) }} />
      <span className="bucket-bar__learning" style={{ width: width(buckets.learning) }} />
    </span>
  );
}

export default function App() {
  const [cards, setCards] = useState<Map<string, CardState>>(() => loadCards());
  const [stats, setStats] = useState(() => loadStats());
  const [settings, setSettings] = useState(() => loadSettings());
  const [history, setHistory] = useState(() => loadHistory());

  /**
   * The cards as they are right now, for `handleAnswer`.
   *
   * It needs to know whether the card being answered had ever been seen —
   * that is what makes a day's "new cards" count — but it cannot read the
   * `cards` state directly without being rebuilt on every answer, and it
   * cannot read it inside the updater either, since React runs updaters twice
   * in development and the history would be written twice.
   */
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const [section, setSection] = useState<SectionId>("A1");
  const [track, setTrack] = useState<string>("grammar");
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  /**
   * Listening is a mode over a deck, not a deck of its own, so it sits
   * alongside `activeDeck` rather than replacing it: leaving the player goes
   * back to the list it was started from.
   */
  const [listenDeck, setListenDeck] = useState<Deck | null>(null);
  /**
   * Set once a level or a hand-picked group has been chosen inside a levelled
   * deck. Until then the level list is shown instead of the practice screen.
   */
  const [session, setSession] = useState<{ cardIds: string[]; intro: boolean } | null>(null);
  const [spanishVoice, setSpanishVoice] = useState(() => hasSpanishVoice());
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    // Re-read on mount as well as subscribing: the voice list can finish
    // loading in the gap between the initial render and this subscription, and
    // that notification would otherwise be missed — leaving the "no voice"
    // warning on screen while speech works perfectly well.
    setSpanishVoice(hasSpanishVoice());
    return onVoicesChanged(() => setSpanishVoice(hasSpanishVoice()));
  }, []);

  const activeSection = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  const decks = useMemo(
    () =>
      CONTENT.decks.filter((deck) =>
        // Words and phrases are not levels, so only the track matters there.
        LEVELLESS_SECTIONS.has(section)
          ? deck.track === track
          : deck.level === section && deck.track === track,
      ),
    [section, track],
  );


  /**
   * How far each visible deck has got, for the bar on its button.
   *
   * Keyed on the deck list and the cards, so it is recomputed when a session
   * ends and not while one is running — the list is not on screen then anyway.
   */
  const deckBars = useMemo(
    () => new Map(decks.map((deck) => [deck.id, deckBuckets(deck, CONTENT, cards)])),
    [decks, cards],
  );

  // State updaters must stay pure: React invokes them twice in development, so
  // persistence happens in effects instead.
  const handleAnswer = useCallback((cardId: string, grade: Grade, correct: boolean) => {
    const timestamp = Date.now();

    setCards((previous) => {
      const next = new Map(previous);
      next.set(cardId, review(getCardOrNew(previous, cardId), grade, timestamp));
      return next;
    });

    setStats((previous) => recordReview(previous, correct, timestamp));

    // Computed out here, not inside the updater, so it is decided once.
    const fresh = !cardsRef.current.get(cardId)?.lastReviewed;
    setHistory((previous) => recordDay(previous, correct, fresh, timestamp));
  }, []);

  /**
   * Pushes a card's due date out without touching its interval or ease.
   * Setting a card aside is not the same as getting it wrong, so nothing about
   * its schedule is penalised — it simply stops appearing for a while.
   */
  const handleSnooze = useCallback((cardId: string, minutes: number) => {
    const until = Date.now() + minutes * 60 * 1000;
    setCards((previous) => {
      const next = new Map(previous);
      const card = getCardOrNew(previous, cardId);
      next.set(cardId, { ...card, due: Math.max(card.due, until) });
      return next;
    });
  }, []);

  /**
   * Switches a card off, or back on.
   *
   * Nothing else about the card is touched: its interval, its ease and its
   * history stay exactly as they were, so switching a word back on resumes
   * where it left off instead of starting it over.
   */
  const handleRetire = useCallback((cardId: string, retired: boolean) => {
    setCards((previous) => {
      const next = new Map(previous);
      next.set(cardId, { ...getCardOrNew(previous, cardId), retired });
      return next;
    });
  }, []);

  useEffect(() => saveCards(cards), [cards]);
  useEffect(() => saveStats(stats), [stats]);
  useEffect(() => saveHistory(history), [history]);

  /** Hands the learner a file. Nothing leaves the device. */
  const downloadProgress = useCallback(() => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiger-learns-${isoDay(Date.now())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const uploadProgress = useCallback((file: File) => {
    file.text().then((text) => {
      const result = importProgress(text);
      if (!result.ok) {
        setImportMessage(result.reason);
        return;
      }
      // Re-read from storage so the merge is what ends up on screen.
      setCards(loadCards());
      setStats(loadStats());
      setHistory(loadHistory());
      setImportMessage(
        `Загружено: ${result.cards} карточек` +
          (result.retired > 0 ? `, выключено ${result.retired}.` : "."),
      );
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<typeof DEFAULT_SETTINGS>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  }, []);

  useEffect(() => saveSettings(settings), [settings]);

  const pauseListening = useCallback((minutes: number) => {
    setSettings((previous) => ({
      ...previous,
      listeningPausedUntil: Date.now() + minutes * 60 * 1000,
    }));
  }, []);

  // Recomputed on every render, which is often enough: the pause only has to
  // lapse by the time the next question is built.
  const listeningPaused = settings.listeningPausedUntil > Date.now();

  /**
   * The deck actually handed to the practice screen, narrowed to the chosen
   * level or ticked words.
   *
   * Memoised deliberately: `Practice` keys its exercise on the deck object, so
   * building a fresh one each render would rebuild the question after every
   * answer — visibly reshuffling the multiple-choice options.
   */
  const practiceDeck = useMemo(() => {
    if (!activeDeck) return null;
    if (!session) return activeDeck;
    return {
      ...activeDeck,
      source: { kind: "cards" as const, ids: session.cardIds },
    };
  }, [activeDeck, session]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-brand__mark">🐅</span>
          <span>Tiger learns!</span>
        </div>

        {/* Everything here is about today, and it stays visible during practice
            so the running score does not need repeating on the exercise screen. */}
        <div className="header-row">
          {/* Two numbers, on purpose. A phone header has room for a glance,
              not a table; the split into right and wrong lives on the progress
              screen, where there is room to read it. */}
          <div className="stats">
            <div className="stat-tile" title="Повторов сегодня">
              <span className="stat-tile__value">{stats.reviewsToday}</span>
              <span className="stat-tile__label">сегодня</span>
            </div>
            <div className="stat-tile" title="Доля верных ответов сегодня">
              {/* Green because it is the share of right answers — the same
                  green a right answer gets, so the number explains itself. */}
              <span className="stat-tile__value stat-tile__value--correct">
                {stats.reviewsToday > 0
                  ? Math.round((stats.correctToday / stats.reviewsToday) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          <SettingsMenu
            settings={settings}
            onChange={updateSettings}
            onExport={downloadProgress}
            onImport={uploadProgress}
          />
        </div>
        {/* Always on screen, practice included: it is both the map of the app
            and the way out of a session, and it sticks to the top so a long
            list of levels never scrolls it away. */}
        <nav className="sections" aria-label="Разделы">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              className="sections__item"
              aria-selected={section === item.id}
              onClick={() => {
                // Choosing a section leaves whatever was open.
                setSession(null);
                setActiveDeck(null);
                setListenDeck(null);
                setSection(item.id);
                // «Прогресс» has no tracks; whatever was selected is simply
                // left alone, since nothing reads it there.
                if (item.tracks[0]) setTrack(item.tracks[0]);
              }}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {listenDeck ? (
          <Listen deck={listenDeck} cards={cards} onExit={() => setListenDeck(null)} />
        ) : section === "progress" ? (
          <Progress cards={cards} stats={stats} history={history} settings={settings} />
        ) : activeDeck && isConjugationDeck(activeDeck) && !session ? (
          <VerbBrowser
            deck={activeDeck}
            cards={cards}
            onStart={(cardIds, mode) => setSession({ cardIds, intro: mode === "intro" })}
            onExit={() => setActiveDeck(null)}
          />
        ) : activeDeck && activeDeck.levelSize && !session ? (
          <LevelPicker
            deck={activeDeck}
            cards={cards}
            onRetire={handleRetire}
            onStart={(cardIds, mode) => setSession({ cardIds, intro: mode === "intro" })}
            onExit={() => setActiveDeck(null)}
          />
        ) : activeDeck ? (
          <>
            <button
              className="back-link"
              onClick={() => (session ? setSession(null) : setActiveDeck(null))}
            >
              ← Назад
            </button>
            <Practice
              // A new selection is a new session: remounting resets the queue.
              key={session ? `${activeDeck.id}:${session.cardIds.join(",")}` : activeDeck.id}
              deck={practiceDeck ?? activeDeck}
              introCardIds={session?.intro ? session.cardIds : undefined}
              cards={cards}
              soundEnabled={settings.soundEnabled}
              advanceMode={settings.advance}
              onAnswer={handleAnswer}
              onSnooze={handleSnooze}
              onPauseListening={pauseListening}
              listeningPaused={listeningPaused}
              onExit={() => {
                setSession(null);
                setActiveDeck(null);
              }}
            />
          </>
        ) : (
          <>
            {/* Nothing is shown while speech works — a banner confirming that
                things are fine is just noise. When there is no Spanish voice the
                warning stays, but folded away. */}
            {importMessage && (
              <p className="voice-warning" onClick={() => setImportMessage(null)}>
                {importMessage}
              </p>
            )}

            {settings.soundEnabled && !spanishVoice && (
              <details className="voice-warning">
                <summary className="voice-warning__summary">
                  Озвучка выключена: в системе нет испанского голоса
                </summary>
                <p className="voice-warning__body">{NO_VOICE_HINT}</p>
                <p className="voice-warning__body">
                  <button
                    className="voice-warning__recheck"
                    onClick={() => {
                      recheckVoices();
                      setSpanishVoice(hasSpanishVoice());
                    }}
                  >
                    Проверить снова
                  </button>
                </p>
                <p className="voice-warning__body">
                  Голоса, которые видит браузер ({listVoices().length}):
                </p>
                <ul className="voice-warning__list">
                  {listVoices().map((voice) => (
                    <li key={`${voice.name}-${voice.lang}`}>
                      {voice.spanish ? "✓ " : ""}
                      {voice.name} — {voice.lang}
                    </li>
                  ))}
                  {listVoices().length === 0 && <li>Список пуст — обнови страницу</li>}
                </ul>
              </details>
            )}

            {activeSection.tracks.length > 1 && (
              <nav className="tracks" aria-label="Разделы">
                {activeSection.tracks.map((trackId) => (
                  <button
                    key={trackId}
                    className="tracks__item"
                    aria-selected={track === trackId}
                    onClick={() => setTrack(trackId)}
                  >
                    {TRACK_TITLES[trackId]}
                  </button>
                ))}
              </nav>
            )}

            <div className="decks">
              {/* No counters here on purpose: a section is an endless drill
                  with no start and no finish, and a number beside it invites
                  the reader to treat it as a target to clear. */}
              {decks.map((deck) => (
                <div className="deck-row" key={deck.id}>
                  <button
                    className="pill deck-row__open"
                    onClick={() => {
                      setSession(null);
                      setActiveDeck(deck);
                    }}
                  >
                    <span>{deck.title}</span>
                    {/* Only once there is something to show: an empty bar on
                        every untouched deck is ten rows of noise. */}
                    {(deckBars.get(deck.id)?.total ?? 0) > 0 &&
                      knownCount(deckBars.get(deck.id)!) + deckBars.get(deck.id)!.learning > 0 && (
                        <DeckBar buckets={deckBars.get(deck.id)!} />
                      )}
                  </button>
                  {/* Listening is a different thing to do with the same deck,
                      so it sits beside the deck rather than inside it. */}
                  {isListenable(deck) && (
                    <button
                      className="deck-row__listen"
                      onClick={() => setListenDeck(deck)}
                      aria-label={`Слушать: ${deck.title}`}
                      title="Слушать без рук"
                    >
                      🎧
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
