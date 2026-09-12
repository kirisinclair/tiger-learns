import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTENT } from "../content";
import { MNEMONICS } from "../content/mnemonics";
import { checkAnswer, checkPronoun, type AnswerVerdict } from "../domain/answer";
import { expandDeck, familyOf, parseCardId } from "../domain/cards";
import { PRONOUN_FULL, conjugationTable } from "../domain/conjugation";
import { deckVerbs, isConjugationDeck, type DeckVerb } from "../domain/deckVerbs";
import { buildExercise, type Exercise } from "../domain/exercises";
import { maturity, orderSession, type CardState, type Grade } from "../domain/srs";
import type { Deck } from "../domain/types";
import { hasSpanishVoice, speak } from "../speech";
import { RuleSheet } from "./RuleSheet";
import { VerbSheet } from "./VerbSheet";

/**
 * How long the result stays on screen before the next question appears.
 * Three seconds either way: the answer is read aloud once it is submitted, and
 * a shorter pause cut the audio off partway through.
 */
const PAUSE_CORRECT_MS = 3000;
const PAUSE_WRONG_MS = 3000;

/** How far ahead a missed card is reinserted, in questions. */
const RETRY_GAP = 5;

interface Props {
  deck: Deck;
  cards: Map<string, CardState>;
  soundEnabled: boolean;
  /** Whether the next question comes by itself or waits for Enter. */
  advanceMode: "auto" | "enter";
  onAnswer: (cardId: string, grade: Grade, correct: boolean) => void;
  /** Pushes a card out of sight for a while without counting it as an answer. */
  onSnooze: (cardId: string, minutes: number) => void;
  /** Turns listening questions off for a while — useful with no headphones. */
  onPauseListening: (minutes: number) => void;
  listeningPaused: boolean;
  /**
   * Cards to introduce before any drilling starts: a word cannot be recalled
   * before it has been met. Empty for a pure review session.
   */
  introCardIds?: string[];
  onExit: () => void;
}

/** How long "отложить" keeps a card away. */
const SNOOZE_MINUTES = 10;

/** How long the "not now" button suppresses listening questions. */
const LISTENING_PAUSE_MINUTES = 15;

interface Feedback {
  verdict: AnswerVerdict;
  answer: string;
  /** The option the learner picked, for multiple choice. */
  chosen: string;
}

export function Practice({
  deck,
  cards,
  soundEnabled,
  advanceMode,
  onAnswer,
  onSnooze,
  onPauseListening,
  listeningPaused,
  introCardIds,
  onExit,
}: Props) {
  // Read inside callbacks and memos without making them depend on the live map.
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  /**
   * Word cards shown before any drilling, in random order.
   *
   * Verbs and plain words are handled the same way — nothing can be recalled
   * before it has been met — and the order is shuffled so the batch is learned
   * as a set rather than as a sequence.
   */
  const introItems = useMemo(() => {
    if (!introCardIds || introCardIds.length === 0) return [];

    const items = introCardIds
      .map((cardId) => {
        const ref = parseCardId(cardId);
        if (ref?.kind === "verbMeaning") {
          const verb = CONTENT.verbs.get(ref.verbId);
          if (!verb) return null;
          return {
            id: cardId,
            es: verb.infinitive,
            ru: verb.ru.join(", "),
            mnemonic: MNEMONICS[verb.id],
          };
        }
        if (ref?.kind === "lexeme") {
          const lex = CONTENT.lexemes.get(ref.lexemeId);
          if (!lex) return null;
          return { id: cardId, es: lex.es, ru: lex.ru.join(", "), mnemonic: undefined };
        }
        if (ref?.kind === "conjugation") {
          const verb = CONTENT.verbs.get(ref.verbId);
          if (!verb) return null;
          return {
            // One card per verb rather than per person: the table is the point.
            id: `intro:${ref.verbId}:${ref.tense}`,
            es: verb.infinitive,
            ru: verb.ru.join(", "),
            mnemonic: MNEMONICS[verb.id],
            table: conjugationTable(verb, ref.tense),
          };
        }
        if (ref?.kind === "phrase") {
          const phrase = CONTENT.phrases.get(ref.phraseId);
          if (!phrase) return null;
          return {
            id: cardId,
            es: phrase.es,
            ru: phrase.ru,
            mnemonic: phrase.literal ? `Дословно: ${phrase.literal}` : undefined,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // A conjugation deck holds one card per person; the intro shows the verb
    // once, with the whole table.
    const unique = [...new Map(items.map((item) => [item.id, item])).values()];

    for (let i = unique.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    return unique;
  }, [introCardIds]);

  const [introIndex, setIntroIndex] = useState(0);
  // Deliberately read through the ref: membership of a state-based deck is
  // fixed when the session starts, and depending on the live card map would
  // rebuild the session — and reshuffle the options — after every answer.
  const cardRefs = useMemo(() => expandDeck(deck, CONTENT, cardsRef.current), [deck]);
  const refById = useMemo(
    () => new Map(cardRefs.map((card) => [card.id, card])),
    [cardRefs],
  );

  const sessionCards = useMemo(
    () => cardRefs.map((card) => ({ id: card.id, family: familyOf(card) })),
    [cardRefs],
  );

  // The session never ends on its own: when the ordering runs out it is rebuilt
  // from the current card states and appended, so practice continues until the
  // learner presses Назад.
  const [queue, setQueue] = useState<string[]>(() =>
    orderSession(sessionCards, cards, Date.now()),
  );
  const [position, setPosition] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showRule, setShowRule] = useState(false);
  const [showVerbs, setShowVerbs] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  /**
   * Guards against answering the same question twice. `feedback` cannot do this
   * on its own: state updates are not applied synchronously, so two key presses
   * in the same tick — or one held-down number key repeating — would both see
   * no feedback yet and both be counted.
   */
  const lockedRef = useRef(false);

  // Only conjugation decks have a verb list worth showing.
  const verbsInDeck = useMemo(
    () => (isConjugationDeck(deck) ? deckVerbs(deck, CONTENT) : []),
    [deck],
  );

  const currentId = queue[position];

  /**
   * The verb this question is about, ready for the sheet.
   *
   * A conjugation drill asks for one form and shows no others, so the moment
   * the paradigm slips there is nothing on screen to recover it from and the
   * only way back is out of the session. This is that way back: the same card
   * as in the verb list, for the verb in front of you.
   */
  const currentVerb = useMemo<DeckVerb | null>(() => {
    const ref = currentId ? refById.get(currentId) : undefined;
    if (!ref) return null;
    // Word cards for verbs show the present, which is what "remind me" means
    // when no tense has been named.
    const tense = ref.kind === "conjugation" ? ref.tense : "present";
    if (ref.kind !== "conjugation" && ref.kind !== "verbMeaning") return null;
    const verb = CONTENT.verbs.get(ref.verbId);
    if (!verb) return null;
    return { verb, tense, table: conjugationTable(verb, tense), cardIds: [ref.id] };
  }, [currentId, refById]);

  const exercise: Exercise | null = useMemo(() => {
    if (!currentId) return null;
    const ref = refById.get(currentId);
    if (!ref) return null;
    const state = cardsRef.current.get(currentId);
    return buildExercise(
      ref,
      deck,
      CONTENT,
      state ? maturity(state) : "new",
      position,
      soundEnabled && !listeningPaused && hasSpanishVoice(),
      // How many times this card has been answered before: it advances the
      // example sentence, so a returning card brings a new one.
      state?.seen ?? 0,
    );
    // `attempt` re-rolls the distractors when a card comes round again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, attempt, refById, deck, position, soundEnabled, listeningPaused]);

  const isListening = exercise?.kind === "listening";

  useEffect(() => {
    if (exercise && isListening && soundEnabled && exercise.speak) speak(exercise.speak);
  }, [exercise, isListening, soundEnabled]);

  useEffect(() => {
    if (!feedback && exercise && exercise.kind !== "choice") inputRef.current?.focus();
  }, [feedback, exercise]);

  // Refill before running dry, so there is never a visible gap.
  useEffect(() => {
    if (position < queue.length - 3) return;
    setQueue((q) => [...q, ...orderSession(sessionCards, cardsRef.current, Date.now())]);
  }, [position, queue.length, sessionCards]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const advance = useCallback(() => {
    timerRef.current = null;
    lockedRef.current = false;
    setFeedback(null);
    setInput("");
    setAttempt((a) => a + 1);
    setPosition((p) => p + 1);
  }, []);

  const submit = useCallback(
    (given: string) => {
      if (!exercise || feedback || lockedRef.current) return;
      lockedRef.current = true;

      const verdict = exercise.pronounAnswers
        ? checkPronoun(given, exercise.pronounAnswers, exercise.pronounAnswersEs)
        : checkAnswer(given, exercise.accepted, {
            allowMissingSubject: exercise.allowMissingSubject,
          });
      // A capitalisation slip on «Вы»/«вы» is a genuine mistake here: the two
      // spellings stand for different Spanish pronouns.
      const correct = verdict === "correct" || verdict === "correctButAccents";

      onAnswer(exercise.cardId, correct ? "good" : "again", correct);
      setFeedback({ verdict, answer: exercise.answer, chosen: given });

      // `speak` holds the Spanish sentence; `answer` may be a Russian pronoun,
      // which a Spanish voice would mangle.
      if (soundEnabled && !isListening) speak(exercise.speak ?? exercise.answer);

      if (!correct) {
        // Reinsert a few questions ahead so it comes back while still fresh.
        setQueue((q) => {
          const next = [...q];
          next.splice(Math.min(position + RETRY_GAP, next.length), 0, exercise.cardId);
          return next;
        });
      }

      // In Enter mode nothing is scheduled: the correction stays up until it
      // has been read and Enter asks for the next question.
      if (advanceMode === "auto") {
        timerRef.current = window.setTimeout(
          advance,
          correct ? PAUSE_CORRECT_MS : PAUSE_WRONG_MS,
        );
      }
    },
    [advance, advanceMode, exercise, feedback, isListening, onAnswer, position, soundEnabled],
  );

  /**
   * Sets a card aside instead of grinding at it.
   *
   * A word that will not stick keeps coming back, which wastes the session and
   * sours the whole thing. Snoozing drops it from the queue and pushes its due
   * date out, so the rest of the deck gets the attention and the stubborn card
   * returns later with a clear head. It is not graded — this is not a failure.
   */
  const snooze = useCallback(() => {
    if (!exercise || feedback) return;
    const snoozedId = exercise.cardId;
    onSnooze(snoozedId, SNOOZE_MINUTES);
    setQueue((q) => q.filter((id, i) => i <= position || id !== snoozedId));
    advance();
  }, [advance, exercise, feedback, onSnooze, position]);

  const skip = useCallback(() => {
    if (!exercise || feedback || lockedRef.current) return;
    onAnswer(exercise.cardId, "again", false);
    setQueue((q) => {
      const next = [...q];
      next.splice(Math.min(position + RETRY_GAP, next.length), 0, exercise.cardId);
      return next;
    });
    advance();
  }, [advance, exercise, feedback, onAnswer, position]);

  // Read by the Enter listener below, which is registered once per exercise
  // and would otherwise close over stale values.
  const liveRef = useRef({ submit, feedback, kind: exercise?.kind });
  liveRef.current = { submit, feedback, kind: exercise?.kind };

  /*
   * Enter in Enter mode: check the answer, then move on.
   *
   * Both jobs belong to this one listener, and the reason is a trap worth
   * naming. Keydown is a discrete event, so React flushes the state update and
   * the effects it triggers *while the event is still propagating*. A separate
   * "advance on Enter" listener registered by such an effect therefore caught
   * the very keystroke that had just submitted the answer, and one press both
   * answered and skipped past the result — which is exactly what it looked
   * like: the answer never appeared.
   *
   * `handled` closes that off for good. It is the event object itself, so no
   * matter how many copies of this listener exist at that instant, a single
   * physical keystroke does a single thing.
   */
  const handledEnterRef = useRef<KeyboardEvent | null>(null);
  useEffect(() => {
    // During the introduction the "Дальше" button has focus and handles Enter
    // by itself; stepping in here would answer an exercise nobody has seen.
    if (advanceMode !== "enter" || introIndex < introItems.length) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.repeat) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (handledEnterRef.current === event) return;
      handledEnterRef.current = event;
      event.preventDefault();

      const { submit: submitNow, feedback: current, kind } = liveRef.current;
      if (current) advance();
      // Multiple choice is answered with the number keys, so there is nothing
      // for Enter to submit there — only something to move on from.
      else if (kind && kind !== "choice") submitNow(inputRef.current?.value ?? "");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, advanceMode, introIndex, introItems.length]);

  // Keys 1-6 pick the matching option, so a whole session can be done from the
  // keyboard without reaching for the mouse.
  useEffect(() => {
    if (!exercise || exercise.kind !== "choice" || !exercise.options || feedback) return;

    const options = exercise.options;
    function onKeyDown(event: KeyboardEvent) {
      // A held key repeats; only the first press is an answer.
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= options.length) return;
      event.preventDefault();
      submit(options[index]);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exercise, feedback, submit]);

  const rule = exercise?.ruleId ? CONTENT.rules.get(exercise.ruleId) : undefined;

  // Introduction phase: meet the words before being asked to recall them.
  if (introIndex < introItems.length) {
    const item = introItems[introIndex];
    return (
      <div className="practice">
        <p className="intro__counter">
          Знакомство: {introIndex + 1} из {introItems.length}
        </p>
        <div className="intro__card">
          <p className="intro__es">{item.es}</p>
          <p className="intro__ru">{item.ru}</p>
          {"table" in item && item.table && (
            <table className="verb-card__table intro__table">
              <tbody>
                {item.table.map(({ person, form }) => (
                  <tr key={person}>
                    <td>{PRONOUN_FULL[person]}</td>
                    <td>
                      <code>{form}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {item.mnemonic && <p className="intro__mnemonic">{item.mnemonic}</p>}
          {soundEnabled && (
            <button className="intro__speak" onClick={() => speak(item.es)}>
              Прослушать
            </button>
          )}
        </div>
        <button
          className="pill pill--accent intro__next"
          onClick={() => setIntroIndex((i) => i + 1)}
          autoFocus
        >
          {introIndex + 1 === introItems.length ? "Начать тренировку" : "Дальше"}
        </button>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="summary">
        <p className="summary__title">В этом разделе пока нет карточек</p>
        <button className="pill pill--accent" onClick={onExit}>
          Назад
        </button>
      </div>
    );
  }

  const inputState = feedback
    ? feedback.verdict === "wrong"
      ? "practice__input--wrong"
      : "practice__input--correct"
    : "";

  return (
    <div className="practice">
      {isListening ? (
        /* The speaker is the question. Making it large and obviously clickable
           says "this one is by ear" without a line of text saying so. */
        <div className="practice__audio">
          <button
            className="practice__audio-button"
            onClick={() => speak(exercise.speak ?? exercise.answer)}
            aria-label="Прослушать"
            title="Прослушать ещё раз"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d="M9 6.5v11l9-5.5-9-5.5z" fill="currentColor" />
            </svg>
          </button>
          {/* The answer replaces the skip link in a slot of fixed height, so
              nothing below moves when the result appears. */}
          <div className="practice__audio-slot">
            {feedback ? (
              <p className="practice__heard">
                <span className="practice__answer">{feedback.answer}</span>
                {exercise.translation && (
                  <>
                    <span className="practice__dash"> — </span>
                    <span>{exercise.translation}</span>
                  </>
                )}
              </p>
            ) : (
              <button
                className="practice__audio-skip"
                onClick={() => onPauseListening(LISTENING_PAUSE_MINUTES)}
              >
                Пропустить аудио на {LISTENING_PAUSE_MINUTES} минут
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Only rendered when there is a question to render. Conjugation drills
           show the Spanish sentence instead, and the answer already appears in
           the input field — a lone "— decides" above it was just noise. */
        exercise.prompt && (
          <p className="practice__prompt">
            {exercise.prompt}
            {/* The answer lands right next to the question, so the pair is read
                as one line instead of hunted for further down the screen. */}
            {feedback && exercise.kind !== "choice" && (
              <>
                <span className="practice__dash"> — </span>
                <span className="practice__answer">{feedback.answer}</span>
              </>
            )}
          </p>
        )
      )}

      <div className="practice__subject">
        {exercise.subject && (
          <>
            {exercise.question && <span>¿</span>}
            <span>{exercise.subject.pronoun}</span>
            {exercise.negative && <span className="practice__negation">no</span>}
            {/* The slot holds the infinitive while the question stands, and the
                correct form once it is answered — so the right answer appears
                exactly where it belongs, without adding a line. */}
            <span className="practice__token">
              {feedback ? (
                <span className="practice__answer">{feedback.answer}</span>
              ) : (
                <>
                  {exercise.subject.head}
                  <span className="practice__ending">{exercise.subject.tail}</span>
                </>
              )}
            </span>
          </>
        )}
        {exercise.complement && <span>{exercise.complement}</span>}
        {exercise.subject && exercise.question && <span>?</span>}
        {exercise.shown && (
          <span className="practice__token">
            {exercise.question && "¿"}
            {/* The pronoun drill hides the subject; once answered it is put
                back where it belongs, tinted, instead of being named apart. */}
            {feedback && exercise.answerEs && (
              <span className="practice__answer">{exercise.answerEs} </span>
            )}
            {exercise.shown}
            {exercise.question && "?"}
          </span>
        )}
      </div>

      {/* The side the learner worked out for herself, revealed directly under
          the sentence it belongs to. The line is always present, empty until
          the answer is in, so nothing below it moves at the moment of reveal. */}
      {!isListening && (
        <p className="practice__translation">{feedback ? exercise.translation : ""}</p>
      )}

      {exercise.kind === "choice" && exercise.options ? (
        <div className="practice__options">
          {exercise.options.map((option, index) => {
            const isAnswer = option === exercise.answer;
            const isChosenWrong = feedback?.verdict === "wrong" && feedback.chosen === option;
            const className = [
              "pill",
              "pill--outline",
              // Correct answer always turns green; a wrong pick turns red too.
              feedback && isAnswer ? "pill--mark-correct" : "",
              isChosenWrong ? "pill--mark-wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={option}
                className={className}
                disabled={Boolean(feedback)}
                onClick={() => submit(option)}
              >
                <span className="pill__number">{index + 1}</span>
                <span className="pill__label">{option}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="practice__input-row">
            <input
              ref={inputRef}
              className={`practice__input ${inputState}`}
              value={input}
              disabled={Boolean(feedback)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                // In Enter mode the window listener above owns the key, so
                // that one press does one thing.
                if (advanceMode === "enter") return;
                if (event.key === "Enter" && !feedback) submit(input);
              }}
            />
            <button
              className="practice__check"
              onClick={() => submit(input)}
              disabled={Boolean(feedback)}
            >
              Check
            </button>
          </div>
          {/* Kept in place after answering too: hiding it would collapse the
              line and drag everything below it upwards. */}
          {exercise.hint && <p className="practice__hint">{exercise.hint}</p>}
          {/* Typed answers need the target spelled out; the choice grid shows it in green. */}
          {feedback?.verdict === "wrongCase" && (
            <p className="practice__note">
              Здесь регистр важен: «Вы» с большой буквы — это usted (вежливо, одному) или
              ustedes (вежливо, нескольким), а «вы» с маленькой — vosotros, обычное обращение
              к группе. Это разные формы, и глагол у них разный.
            </p>
          )}
        </>
      )}

      {/* Everything that only appears after answering lives in one slot with a
          reserved height, so the footer stays where it was. */}
      <div className="practice__after">
        {feedback && exercise.grammarNote && (
          <p className="practice__note practice__note--center">{exercise.grammarNote}</p>
        )}
        {feedback && !isListening && exercise.allMeanings && exercise.allMeanings.length > 1 && (
          <p className="practice__meanings">
            Также: {exercise.allMeanings.slice(1).join(", ")}
          </p>
        )}
      </div>

      <div className="practice__footer">
        {rule ? (
          <button onClick={() => setShowRule(true)}>Грамматическое правило</button>
        ) : (
          <span />
        )}
        {currentVerb && (
          <button className="practice__remind" onClick={() => setShowReminder(true)}>
            Напомнить
          </button>
        )}
        {verbsInDeck.length > 0 && (
          <button className="practice__verb-list" onClick={() => setShowVerbs(true)}>
            Список глаголов
          </button>
        )}
        <div className="practice__actions">
          <button
            className="practice__snooze"
            onClick={snooze}
            disabled={Boolean(feedback)}
            aria-label={`Отложить на ${SNOOZE_MINUTES} минут`}
            title={`Отложить на ${SNOOZE_MINUTES} минут — карточка не будет попадаться`}
          >
            ⏱
          </button>
          <button onClick={skip} disabled={Boolean(feedback)}>
            Пропустить→
          </button>
        </div>
      </div>

      {showRule && rule && <RuleSheet rule={rule} onClose={() => setShowRule(false)} />}
      {showVerbs && (
        <VerbSheet title={deck.title} verbs={verbsInDeck} onClose={() => setShowVerbs(false)} />
      )}
      {showReminder && currentVerb && (
        <VerbSheet
          title={currentVerb.verb.infinitive}
          verbs={[currentVerb]}
          onClose={() => setShowReminder(false)}
        />
      )}
    </div>
  );
}
