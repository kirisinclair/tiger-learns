/**
 * Content model.
 *
 * Everything the learner sees is data, not code: words, verbs, decks and rules
 * live in `src/content` as plain objects so they can be edited without touching
 * the application.
 */

export type Cefr = "A1" | "A2" | "B1";

export type Dialect = "latam" | "spain";

/**
 * Grammatical person, in the order conjugation tables are always rendered.
 *
 * Spanish has four ways of saying "you" and they are not interchangeable:
 *  - `tu`       — one person, informal (everywhere except the voseo regions)
 *  - `vos`      — one person, informal, with its own verb forms; the normal
 *                 pronoun in Argentina, Uruguay, Paraguay and Central America
 *  - `usted`    — one person, polite; takes third-person singular forms
 *  - `vosotros` — several people, informal; Spain only
 *  - `ustedes`  — several people, polite in Spain, the only plural "you" in
 *                 Latin America; takes third-person plural forms
 *
 * `usted` and `ustedes` share their forms with `el` and `ellos`, but they are
 * separate persons here on purpose: choosing the right one is a real skill, and
 * confusing them is a real mistake.
 */
export type Person =
  | "yo"
  | "tu"
  | "vos"
  | "usted"
  | "el"
  | "nosotros"
  | "vosotros"
  | "ustedes"
  | "ellos";

export type PartOfSpeech =
  | "verb"
  | "noun"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interrogative"
  | "numeral"
  | "phrase"
  | "other";

/** One dictionary entry. A word appears here exactly once, however many decks use it. */
export interface LexemeEntry {
  /** Stable id, also used as the SRS card key. */
  id: string;
  es: string;
  /** Russian translations, most common first. */
  ru: string[];
  pos: PartOfSpeech;
  /** Frequency rank in Latin-American Spanish; `null` when outside the top list. */
  rank: number | null;
  cefr: Cefr;
  /** Thematic tags used to assemble A2 vocabulary decks. */
  topics?: string[];
  /** Peninsular equivalent, when the Latin-American form differs. */
  spain?: string;
  /** Noun gender, needed for articles. */
  gender?: "m" | "f";
  example?: { es: string; ru: string };
  /**
   * Warning shown after the answer, for words whose Russian translation is
   * misleading on its own — most often prepositions, where one Russian word
   * covers two Spanish ones.
   */
  note?: string;
}

/** Verb infinitive plus whatever the regular rules cannot derive. */
export interface VerbEntry {
  id: string;
  infinitive: string;
  ru: string[];
  group: "ar" | "er" | "ir";
  cefr: Cefr;
  rank: number | null;
  /** `true` when at least one tense deviates from the regular pattern. */
  irregular?: boolean;
  /** Explicit overrides, keyed by tense then person. Missing forms are generated. */
  forms?: Partial<Record<Tense, Partial<Record<Person, string>>>>;
  topics?: string[];
  /**
   * Russian prompt overrides. The Russian conjugator handles regular patterns;
   * these cover stem mutations it cannot guess (ходить → хожу, любить → люблю).
   */
  ruPresent?: Partial<Record<Person, string>>;
  /** Russian past stem without the -л ending, when it is not simply "infinitive − ть". */
  ruPastStem?: string;
  /** Full Russian past forms, for verbs the stem+л pattern cannot express (мочь → мог). */
  ruPast?: Partial<Record<Person, string>>;
  /**
   * Sentence tail that turns a bare conjugation drill into a usable sentence:
   * "Yo hablo **español**" / "Я говорю **по-испански**". Attached at index build
   * time from `content/verbComplements`.
   */
  complement?: { es: string; ru: string };
}

export type Tense =
  | "present"
  | "preterite"
  | "imperfect"
  | "future"
  | "conditional"
  | "subjunctivePresent"
  | "imperativeAffirmative";

/**
 * A ready-made phrase.
 *
 * Selection follows a hybrid of three axes: communicative function (so no
 * everyday need is missing), spoken frequency within each function (so the
 * result sounds like real Latin-American speech), and a set of slot frames
 * that generate many utterances from one pattern.
 */
export interface PhraseEntry {
  id: string;
  es: string;
  ru: string;
  /** Communicative function: greeting, request, emotion, opinion, … */
  fn: PhraseFunction;
  /** Everyday situation where it is used, when it is situation-bound. */
  situation?: string;
  cefr: Cefr;
  /**
   * Usefulness rank, 1 = most useful overall. Drives which "часть" a phrase
   * lands in: part 1 holds ranks 1-50, part 2 holds 51-100, and so on.
   */
  rank: number;
  /** True for slot frames such as "¿Dónde está ___?". */
  frame?: boolean;
  /** Peninsular variant, when the Latin-American wording differs. */
  spain?: string;
  /** Literal gloss, shown when the Russian translation is not word-for-word. */
  literal?: string;
  note?: string;
}

export type PhraseFunction =
  | "greeting"
  | "politeness"
  | "smalltalk"
  | "request"
  | "question"
  | "emotion"
  | "opinion"
  | "agreement"
  | "description"
  | "quantity"
  | "time"
  | "problem"
  | "frame";

/** How a deck picks its cards out of the content pool. */
export type DeckSource =
  | { kind: "lexemes"; ids: string[] }
  | { kind: "lexemeQuery"; pos?: PartOfSpeech[]; cefr?: Cefr[]; topics?: string[]; rankRange?: [number, number] }
  /**
   * A slice of the frequency order, whatever kind of entity each word is.
   *
   * Distinct from `lexemeQuery` because the frequency list is not a list of
   * dictionary words: `tener` and `hacer` belong near the top of it and they
   * are verbs, with cards of their own. Resolving through the order rather
   * than filtering the dictionary is what lets one list hold both.
   */
  | { kind: "frequency"; rankRange: [number, number] }
  | { kind: "conjugation"; verbIds: string[]; tenses: Tense[] }
  | { kind: "verbMeaning"; verbIds: string[] }
  | { kind: "phrases"; rankRange?: [number, number]; fns?: PhraseFunction[] }
  /** An explicit list of card ids — what a hand-picked selection produces. */
  | { kind: "cards"; ids: string[] }
  /**
   * Selected by how the learner is doing rather than by content: the only view
   * that can answer "which words keep defeating me".
   */
  | { kind: "state"; filter: "hard" | "due" | "unseen" | "known" }
  | { kind: "combined"; deckIds: string[] };

export type ExerciseKind =
  | "choice"
  | "input"
  | "translateToEs"
  | "translateToRu"
  | "listening"
  /** Spanish form shown without its pronoun; name the person in Russian. */
  | "pronoun"
  /** Only the Russian sentence is shown; produce the Spanish from scratch. */
  | "produce";

/** Shape of a drilled sentence. */
export type SentenceMood = "statement" | "negative" | "question";

/**
 * One sentence built around a verb.
 *
 * The verb itself is conjugated at runtime for whichever person the card asks
 * about; a frame supplies everything around it. Keeping the tail separate from
 * the verb is what lets one frame serve all nine persons and both tenses.
 */
export interface SentenceFrame {
  verbId: string;
  /** Words after the verb in Spanish: "español", "a mi madre", "en la Luna". */
  es: string;
  /** The same tail in Russian, in whatever case the Russian verb governs. */
  ru: string;
  mood: SentenceMood;
  /**
   * Plural forms of the tail, for frames whose complement agrees with the
   * subject. `Yo soy médico` but `Nosotros somos médicos`, «Я врач» but «Мы
   * врачи» — without these a predicate noun or adjective is simply wrong for
   * half the persons. Frames whose tail cannot inflect leave them out.
   */
  esPlural?: string;
  ruPlural?: string;
  /** Literal gloss, when the Russian wording is not word-for-word. */
  literal?: string;
  /**
   * A different Russian verb for this frame, by key into `RU_VERB_ALIASES`.
   *
   * Russian picks the verb to match the object where Spanish reuses one:
   * `hacer` is "делать" with homework, "готовить" with dinner, "задавать" with
   * questions and "собирать" with a suitcase. Building the cue from the verb's
   * single dictionary translation produced phrases nobody says - "делать
   * вопросы" - so a frame may name the verb its own object calls for.
   */
  ruVerb?: string;
  /**
   * The Russian tail in the past tense, when it differs.
   *
   * Needed by the possessive `tener`: "У меня есть собака" in the present but
   * "У меня была собака" in the past, where the copula agrees with the object
   * rather than the subject and so belongs to the tail.
   */
  ruTailPast?: string;
}

/**
 * A Russian verb the cue can be built from, whether it comes from the entry
 * being drilled or from a frame's `ruVerb` override.
 */
export interface RuVerbSource {
  ru: string[];
  ruPresent?: Partial<Record<Person, string>>;
  ruPast?: Partial<Record<Person, string>>;
  ruPastStem?: string;
  /**
   * Replaces the subject pronoun. Russian expresses possession as a place
   * rather than an action: "У меня есть", never "Я имею".
   */
  ruSubject?: Partial<Record<Person, string>>;
  /** Replaces "не" plus the verb in negatives, e.g. "нет" for possession. */
  ruNegative?: { present: string; past: string };
}

export interface Deck {
  id: string;
  title: string;
  level: Cefr;
  /**
   * Which tab the deck lives under. `vocabulary`, `grammar` and `phrases` are
   * the course; `frequency`, `topics` and `state` are the three ways into the
   * dictionary — the same words reached by a different route.
   */
  track:
    | "grammar"
    /** The word section: four ways into one pool. */
    | "frequency"
    | "topics"
    | "verbs"
    | "state"
    | "phrases";
  source: DeckSource;
  /** Exercise kinds this deck may use, in escalating difficulty order. */
  exercises: ExerciseKind[];
  /** Id of the grammar rule shown behind "Посмотреть грамматическое правило". */
  ruleId?: string;
  /** Decks with `hidden` are building blocks for combined decks only. */
  hidden?: boolean;
  /**
   * When set, the deck opens a level list instead of starting straight away:
   * its words are cut into batches of this size, and practice is scoped to the
   * batch the learner picks. Meeting eighty words at once teaches none of them.
   */
  levelSize?: number;
}

/** Structured rule content: no markdown parser needed, tables stay exact. */
export type RuleBlock =
  | { type: "text"; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "examples"; items: Array<{ es: string; ru: string }> };

export interface GrammarRule {
  id: string;
  title: string;
  /** One-sentence version, shown inline right after a wrong answer. */
  short: string;
  blocks: RuleBlock[];
}
