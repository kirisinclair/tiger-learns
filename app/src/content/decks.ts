import type { Deck, ExerciseKind } from "../domain/types";
import { FREQUENCY_BLOCK_SIZE } from "./frequency";
import { FREQUENCY_ORDER } from "./frequencyOrder";
import {
  PERIPHRASIS_RANGE,
  PHRASES,
  PHRASE_PART_SIZE,
  PHRASE_PART_SUBTITLES,
} from "./phrases";
import { TOPIC_TITLES } from "./lexemes";
import {
  A1_IRREGULAR_CONJUGATION_IDS,
  A1_IRREGULAR_VERB_IDS,
  A1_REGULAR_VERB_IDS,
  A2_IRREGULAR_VERB_IDS,
  A2_REGULAR_VERB_IDS,
  REGULAR_AR_VERBS,
  REGULAR_ER_VERBS,
  REGULAR_IR_VERBS,
} from "./verbs";

/**
 * Deck catalogue.
 *
 * A deck is a name plus a query over the content pool, so adding vocabulary
 * never means touching deck code — and the same word can appear in a thematic
 * deck and in the frequency deck without being stored twice.
 *
 * `exercises` lists the formats in escalating difficulty: a new card gets the
 * first, and each level of maturity moves one step along.
 */

/** Vocabulary ladder: recognise, then recall, then produce, then hear. */
const VOCAB_LADDER: ExerciseKind[] = ["choice", "translateToRu", "translateToEs", "listening"];

/**
 * Conjugation ladder, in rising difficulty:
 * pick the ending → name the person behind a form → write the form with the
 * infinitive in view → produce the whole sentence from the Russian alone.
 */
const CONJUGATION_LADDER: ExerciseKind[] = ["choice", "pronoun", "input", "produce"];

/** Phrases: recognise it, produce it, then understand it by ear. */
const PHRASE_LADDER: ExerciseKind[] = ["choice", "translateToEs", "translateToEs", "listening"];

const ids = (verbs: typeof REGULAR_AR_VERBS) => verbs.map((v) => v.id);

/* -------------------------------------------------------------------------- */
/* A1                                                                         */
/* -------------------------------------------------------------------------- */

/** The three -ar/-er/-ir groups are one deck: the ending is a grammar concern,
 *  and for learning what a verb means the split only fragments the practice. */
const ALL_REGULAR_VERB_IDS = [
  ...ids(REGULAR_AR_VERBS),
  ...ids(REGULAR_ER_VERBS),
  ...ids(REGULAR_IR_VERBS),
];

/**
 * Verb meanings live in the word section, not in a level.
 *
 * Levels are for grammar. Knowing what `buscar` means is vocabulary, and it is
 * needed whichever level you are on — splitting it by CEFR only fragmented the
 * practice.
 */
const VERB_DECKS: Deck[] = [
  {
    id: "words.verbs.regular",
    title: `Правильные глаголы (${ALL_REGULAR_VERB_IDS.length})`,
    level: "A1",
    track: "verbs",
    source: { kind: "verbMeaning", verbIds: ALL_REGULAR_VERB_IDS },
    exercises: VOCAB_LADDER,
    levelSize: 10,
  },
  {
    id: "words.verbs.irregular",
    title: `Неправильные глаголы (${[...A1_IRREGULAR_VERB_IDS, ...A2_IRREGULAR_VERB_IDS].length})`,
    level: "A1",
    track: "verbs",
    source: {
      kind: "verbMeaning",
      verbIds: [...A1_IRREGULAR_VERB_IDS, ...A2_IRREGULAR_VERB_IDS],
    },
    exercises: VOCAB_LADDER,
    levelSize: 10,
  },
  {
    // Verbs that are not conjugated in the course but whose meaning is worth
    // knowing. They live here rather than among the topics: a verb is a verb.
    id: "words.verbs.other",
    title: "Другие глаголы: значения",
    level: "A2",
    track: "verbs",
    source: { kind: "lexemeQuery", topics: ["verbmeanings"] },
    exercises: VOCAB_LADDER,
    levelSize: 10,
  },
];

const A1_GRAMMAR: Deck[] = [
  {
    id: "a1.gram.present",
    title: "Спряжения глаголов -ar, -er, -ir в настоящем времени",
    level: "A1",
    track: "grammar",
    source: { kind: "conjugation", verbIds: A1_REGULAR_VERB_IDS, tenses: ["present"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.present.regular",
  },
  {
    id: "a1.gram.preterite",
    title: "Спряжения глаголов -ar, -er, -ir в прошедшем времени",
    level: "A1",
    track: "grammar",
    source: { kind: "conjugation", verbIds: A1_REGULAR_VERB_IDS, tenses: ["preterite"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.preterite.regular",
  },
  {
    id: "a1.gram.serestar.present",
    title: 'Ser, Estar: Глаголы "быть" в настоящем времени',
    level: "A1",
    track: "grammar",
    source: { kind: "conjugation", verbIds: ["v.ser", "v.estar"], tenses: ["present"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.ser.estar.present",
  },
  {
    id: "a1.gram.serestar.past",
    title: 'Ser, Estar: Глаголы "быть" в прошедшем времени',
    level: "A1",
    track: "grammar",
    source: { kind: "conjugation", verbIds: ["v.ser", "v.estar"], tenses: ["preterite"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.ser.estar.past",
  },
  {
    id: "a1.gram.irregular.present",
    title: "Неправильные глаголы в настоящем времени",
    level: "A1",
    track: "grammar",
    source: { kind: "conjugation", verbIds: A1_IRREGULAR_CONJUGATION_IDS, tenses: ["present"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.present.irregular",
  },
  {
    id: "a1.gram.irregular.past",
    title: "Неправильные глаголы в прошедшем времени",
    level: "A1",
    track: "grammar",
    source: { kind: "conjugation", verbIds: A1_IRREGULAR_CONJUGATION_IDS, tenses: ["preterite"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.preterite.irregular",
  },
];

/* -------------------------------------------------------------------------- */
/* A2                                                                         */
/* -------------------------------------------------------------------------- */

/** The A1 core stays in play at A2, extended with the rest of the verbs. */
const ALL_CONJUGATED_VERB_IDS = [
  ...A1_REGULAR_VERB_IDS,
  ...A1_IRREGULAR_VERB_IDS,
  ...A2_REGULAR_VERB_IDS,
  ...A2_IRREGULAR_VERB_IDS,
];

const A2_GRAMMAR: Deck[] = [
  {
    id: "a2.gram.present.rest",
    title: "Настоящее время: остальные правильные глаголы",
    level: "A2",
    track: "grammar",
    source: { kind: "conjugation", verbIds: A2_REGULAR_VERB_IDS, tenses: ["present"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.present.regular",
  },
  {
    id: "a2.gram.preterite.rest",
    title: "Прошедшее время: остальные правильные глаголы",
    level: "A2",
    track: "grammar",
    source: { kind: "conjugation", verbIds: A2_REGULAR_VERB_IDS, tenses: ["preterite"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.preterite.regular",
  },
  {
    id: "a2.gram.irregular.rest",
    title: "Остальные неправильные глаголы: настоящее и прошедшее",
    level: "A2",
    track: "grammar",
    source: {
      kind: "conjugation",
      verbIds: A2_IRREGULAR_VERB_IDS,
      tenses: ["present", "preterite"],
    },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.present.irregular",
  },
  {
    id: "a2.gram.imperfect",
    title: "Pretérito Imperfecto: фон и привычки в прошлом",
    level: "A2",
    track: "grammar",
    source: {
      kind: "conjugation",
      // Imperfecto has only three irregular verbs, so the A1 core plus those is
      // all the practice this tense needs.
      verbIds: [...A1_REGULAR_VERB_IDS, "v.ser", "v.ir", "v.ver"],
      tenses: ["imperfect"],
    },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.imperfect",
  },
  {
    id: "a2.gram.future",
    title: "Futuro simple: будущее время",
    level: "A2",
    track: "grammar",
    source: { kind: "conjugation", verbIds: ALL_CONJUGATED_VERB_IDS, tenses: ["future"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.future",
  },
  {
    id: "a2.gram.conditional",
    title: "Condicional simple: форма «бы»",
    level: "A2",
    track: "grammar",
    source: { kind: "conjugation", verbIds: ALL_CONJUGATED_VERB_IDS, tenses: ["conditional"] },
    exercises: CONJUGATION_LADDER,
    ruleId: "rule.conditional",
  },
];

/* -------------------------------------------------------------------------- */
/* Phrases and frequency — cross-level tracks                                 */
/* -------------------------------------------------------------------------- */

const PHRASE_PART_COUNT = Math.ceil(PHRASES.length / PHRASE_PART_SIZE);

/**
 * Phrases sit inside the levels, but keep their own order.
 *
 * A ready-made phrase is not the product of grammar — "¿Cuánto cuesta?" is
 * usable on day one — so the useful ordering is how often it comes up, not how
 * hard its grammar is. The first parts therefore belong to A1 and the later
 * ones to A2, while the numbering stays in usefulness order throughout.
 */
/**
 * Verb constructions, ahead of the numbered parts.
 *
 * First because it pays first: these are the frames the rest of the language
 * is spoken through, and every verb already learned drops straight into them.
 * Kept out of the parts rather than merged into part 1 — the parts are graded
 * by usefulness of a whole utterance, while this is one pattern shown fifty
 * times, and mixing the two would bury it.
 */
const PERIPHRASIS_DECK: Deck = {
  id: "phrases.periphrasis",
  title: "Глагольные обороты",
  level: "A1",
  // Filed with the verbs, not with the phrases: what is drilled here is a verb
  // frame, not something anyone says on its own. It sits next to the verb
  // meanings because that is what it is — a verb, and what it does to the one
  // that follows it.
  track: "verbs",
  source: { kind: "phrases", rankRange: PERIPHRASIS_RANGE },
  exercises: PHRASE_LADDER,
  ruleId: "rule.phrases",
  levelSize: 10,
};

const PHRASE_DECKS: Deck[] = Array.from({ length: PHRASE_PART_COUNT }, (_, i) => {
  const from = i * PHRASE_PART_SIZE + 1;
  const to = Math.min((i + 1) * PHRASE_PART_SIZE, PHRASES.length);
  const subtitle = PHRASE_PART_SUBTITLES[i];
  return {
    id: `phrases.part${i + 1}`,
    title: subtitle ? `Часть ${i + 1} · ${subtitle}` : `Часть ${i + 1}`,
    level: i < 2 ? "A1" : "A2",
    track: "phrases",
    source: { kind: "phrases", rankRange: [from, to] },
    exercises: PHRASE_LADDER,
    ruleId: "rule.phrases",
    // Fifty phrases at once is the same wall eighty verbs were: met in tens,
    // with the phrase shown before it is asked for.
    levelSize: 10,
  } satisfies Deck;
});

/* -------------------------------------------------------------------------- */
/* The dictionary: three ways into one pool of words                          */
/* -------------------------------------------------------------------------- */

const FREQUENCY_BLOCK_COUNT = Math.ceil(FREQUENCY_ORDER.length / FREQUENCY_BLOCK_SIZE);

/** Blocks of fifty, each learned in tens: "12 из 20" is a reachable number. */
const FREQUENCY_DECKS: Deck[] = Array.from({ length: FREQUENCY_BLOCK_COUNT }, (_, i) => {
  const from = i * FREQUENCY_BLOCK_SIZE + 1;
  const to = Math.min((i + 1) * FREQUENCY_BLOCK_SIZE, FREQUENCY_ORDER.length);
  return {
    id: `dict.freq${i + 1}`,
    title: `Слова ${from}-${to} по частотности`,
    level: "A1",
    track: "frequency",
    // Reads the frequency order rather than filtering the dictionary, so a
    // verb that belongs near the top of the list can actually appear there.
    source: { kind: "frequency", rankRange: [from, to] },
    exercises: VOCAB_LADDER,
    // Twenty, so a block of a hundred is five levels. Ten split a hundred into
    // ten pieces, and a piece that small was over before it registered.
    levelSize: 20,
  } satisfies Deck;
});

const TOPIC_DECKS: Deck[] = Object.entries(TOPIC_TITLES).map(([topic, title]) => ({
  id: `dict.topic.${topic}`,
  title,
  level: "A2",
  track: "topics",
  source: { kind: "lexemeQuery", topics: [topic] },
  exercises: VOCAB_LADDER,
  levelSize: 10,
}));

/**
 * Selected by how the learner is doing, not by content.
 *
 * "Трудные" is the one this whole section exists for: a word that keeps being
 * forgotten is otherwise scattered among hundreds of others, and there is no
 * way to sit down and deal with exactly those.
 */
const STATE_DECKS: Deck[] = [
  {
    id: "dict.state.hard",
    title: "Трудные слова",
    level: "A1",
    track: "state",
    source: { kind: "state", filter: "hard" },
    exercises: VOCAB_LADDER,
  },
  {
    id: "dict.state.due",
    title: "К повторению сегодня",
    level: "A1",
    track: "state",
    source: { kind: "state", filter: "due" },
    exercises: VOCAB_LADDER,
  },
  {
    id: "dict.state.unseen",
    title: "Ещё не начатые",
    level: "A1",
    track: "state",
    source: { kind: "state", filter: "unseen" },
    exercises: VOCAB_LADDER,
    levelSize: 10,
  },
  {
    id: "dict.state.known",
    title: "Уверенно знаю",
    level: "A1",
    track: "state",
    source: { kind: "state", filter: "known" },
    exercises: VOCAB_LADDER,
  },
];

/* -------------------------------------------------------------------------- */
/* "Тренировать все" roll-ups                                                 */
/* -------------------------------------------------------------------------- */

function trainAll(id: string, level: Deck["level"], track: Deck["track"], decks: Deck[]): Deck {
  return {
    id,
    title: "Тренировать все",
    level,
    track,
    source: { kind: "combined", deckIds: decks.map((d) => d.id) },
    exercises: decks[0]?.exercises ?? ["choice"],
    ruleId: decks[0]?.ruleId,
  };
}

/**
 * Four sections, each answering one question.
 *
 * `A1` and `A2` are grammar only — a level is a stage of grammatical
 * competence, and lexis does not progress that way: `el agua` is needed on day
 * one whatever your level. `Слова` and `Фразы` therefore sit outside the levels
 * entirely, and neither is split by CEFR.
 */
export const DECKS: Deck[] = [
  ...A1_GRAMMAR,
  trainAll("a1.gram.all", "A1", "grammar", A1_GRAMMAR),
  ...A2_GRAMMAR,
  trainAll("a2.gram.all", "A2", "grammar", A2_GRAMMAR),

  // Words: four ways into one pool of cards.
  ...FREQUENCY_DECKS,
  ...TOPIC_DECKS,
  ...VERB_DECKS,
  PERIPHRASIS_DECK,
  ...STATE_DECKS,

  ...PHRASE_DECKS,
  trainAll("phrases.all", "A1", "phrases", PHRASE_DECKS),
];
