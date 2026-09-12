import type { ContentIndex } from "../content";
import type { CardRef } from "./cards";
import { PERSONS, PRONOUN, conjugate } from "./conjugation";
import { RU_VERB_ALIASES } from "../content/ruVerbs";
import {
  RU_PERSON_NOTE,
  RU_SUBJECT,
  ruPast as ruPastForm,
  ruPresent as ruPresentForm,
  ruSubject as ruSubjectForm,
} from "./russian";
import type { Maturity } from "./srs";
import type {
  Deck,
  RuVerbSource,
  ExerciseKind,
  LexemeEntry,
  Person,
  SentenceFrame,
  Tense,
  VerbEntry,
} from "./types";

/** Everything the practice screen needs to render one question. */
export interface Exercise {
  cardId: string;
  kind: ExerciseKind;
  /** Russian cue on the top line. */
  prompt: string;
  /** Second line of a conjugation drill: pronoun plus the infinitive token. */
  subject?: { pronoun: string; head: string; tail: string };
  /** Sentence tail after the answer slot: "Yo [hablar] **español**". */
  complement?: string;
  /** Renders "no" before the verb slot. */
  negative?: boolean;
  /** Wraps the Spanish line in ¿ … ? */
  question?: boolean;
  /** Pronoun drills accept several persons; case matters only for вы/Вы. */
  pronounAnswers?: string[];
  /** The same persons written in Spanish, also accepted as answers. */
  pronounAnswersEs?: string[];
  /**
   * Every meaning of the word, most common first, shown once the answer is in.
   * A verb rarely has a single translation, and seeing the rest at the moment
   * of recall is how the other senses get picked up.
   */
  allMeanings?: string[];
  /** Russian for the correct answer, shown after a listening question. */
  translation?: string;
  /** Gender and number of the answer, with the rule behind it. */
  grammarNote?: string;
  /** Spanish text displayed as the question (ES → RU direction). */
  shown?: string;
  /** Spanish form of the answer, slotted into `shown` once the card is answered. */
  answerEs?: string;
  /** The reference answer, fully accented. */
  answer: string;
  /** Every spelling accepted as correct. */
  accepted: string[];
  /** Multiple-choice options, already shuffled. */
  options?: string[];
  /** Spanish text for speech synthesis. */
  speak?: string;
  ruleId?: string;
  /** Conjugation drills print the pronoun, so typing it again is optional. */
  allowMissingSubject?: boolean;
  hint?: string;
}

const MATURITY_STEP: Record<Maturity, number> = {
  new: 0,
  learning: 1,
  young: 2,
  mature: 3,
};

/**
 * Picks the exercise kind for a card.
 *
 * Grammar decks climb a ladder: the format gets harder as the card matures,
 * because producing a conjugated form from nothing is pointless before the
 * ending is known at all.
 *
 * Vocabulary decks rotate instead. A word is either known or not, and the
 * useful thing is meeting it from every angle — recognise it, translate into
 * Russian, produce the Spanish. Rotating by position in the session also stops
 * long runs of the same format, which is what makes a session feel monotonous.
 */
export function pickKind(
  deck: Deck,
  cardMaturity: Maturity,
  position: number,
  cardId: string,
): ExerciseKind {
  const kinds = deck.exercises.length > 0 ? deck.exercises : (["choice"] as ExerciseKind[]);

  if (deck.track === "grammar") {
    /*
     * A window that widens as the card matures, rotated within.
     *
     * Taking the single kind at the maturity step looked like a ladder but
     * behaved like a rut: one correct answer moves every card to the same step,
     * so the whole session locks onto one format. Rotating inside a window
     * keeps the progression — a brand-new card is never asked to be produced
     * from nothing — while making sure several formats actually come up.
     */
    const window = Math.min(MATURITY_STEP[cardMaturity] + 2, kinds.length);
    return kinds[(position + hashCode(cardId)) % window];
  }

  // Offsetting by the card as well as the position keeps two cards in a row
  // from always landing on the same format.
  return kinds[(position + hashCode(cardId)) % kinds.length];
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample<T>(pool: T[], count: number, exclude: (item: T) => boolean): T[] {
  return shuffle(pool.filter((item) => !exclude(item))).slice(0, count);
}

const PAST_TENSES: Tense[] = ["preterite", "imperfect"];

/** Persons that take a plural predicate. */
const PLURAL_PERSONS = new Set<Person>(["nosotros", "vosotros", "ustedes", "ellos"]);

/**
 * What a listening card asks for.
 *
 * The card shows a play button and an empty box and nothing else, so the
 * task has to be stated. Both languages are accepted: hearing "usted" and
 * typing "вы" proves the word was understood, which is what a listening drill
 * is for — spelling is tested by the other formats.
 */
const LISTEN_HINT = "*Запиши, что слышишь — по-испански или переводом";
const LISTEN_PHRASE_HINT = "*Запиши фразу по-испански или её перевод";

/** Builds the question for one card. */
export function buildExercise(
  card: CardRef,
  deck: Deck,
  index: ContentIndex,
  cardMaturity: Maturity,
  position: number,
  /** False when the device has no Spanish voice; listening is then impossible. */
  soundReady: boolean,
  /** How many times this card has been answered before. */
  encounter: number,
): Exercise | null {
  let kind = pickKind(deck, cardMaturity, position, card.id);
  // A listening question with no voice is unanswerable, so it becomes the
  // nearest productive format instead of a silent dead end.
  if (kind === "listening" && !soundReady) kind = "translateToEs";

  switch (card.kind) {
    case "conjugation":
      return buildConjugation(card, deck, index, kind, encounter);
    case "verbMeaning":
      return buildVerbMeaning(card, deck, index, kind);
    case "lexeme":
      return buildLexeme(card, deck, index, kind);
    case "phrase":
      return buildPhrase(card, deck, index, kind);
  }
}

function buildConjugation(
  card: Extract<CardRef, { kind: "conjugation" }>,
  deck: Deck,
  index: ContentIndex,
  kind: ExerciseKind,
  encounter: number,
): Exercise | null {
  const verb = index.verbs.get(card.verbId);
  if (!verb) return null;

  const answer = conjugate(verb, card.tense, card.person);
  const isPast = PAST_TENSES.includes(card.tense);
  // The infinitive is shown with its -ar/-er/-ir ending tinted, as on the
  // reference screens: the learner replaces exactly that part.
  const head = verb.infinitive.slice(0, -2);
  const tail = verb.infinitive.slice(-2);

  // Distractors are the verb's other persons plus the bare infinitive: the
  // learner has to isolate the ending rather than recognise the word.
  const others = PERSONS.filter((p) => p !== card.person).map((p) =>
    conjugate(verb, card.tense, p),
  );
  const pool = [...new Set([...others, verb.infinitive])].filter((form) => form !== answer);
  const options = shuffle([answer, ...pool.slice(0, 5)]);

  // A whole sentence rather than a bare form: vocabulary, prepositions and set
  // expressions are picked up alongside the ending. The frame is chosen from
  // the card id so it stays the same every time this card comes round.
  const frame =
    pickFrame(card.verbId, card.tense, card.person, encounter, index) ?? fallbackFrame(verb);
  const negative = frame?.mood === "negative";
  const question = frame?.mood === "question";

  const pronoun = PRONOUN[card.person];
  const negatedAnswer = negative ? `no ${answer}` : answer;

  // A predicate noun or adjective agrees with the subject in number, in both
  // languages: "Nosotros somos médicos", «Мы врачи». Frames that inflect carry
  // a plural tail; the rest are the same whoever the subject is.
  const plural = PLURAL_PERSONS.has(card.person);
  const tailEs = (plural && frame?.esPlural) || frame?.es;
  const tailRu = (plural && frame?.ruPlural) || frame?.ru;

  const sentence = tailEs ? `${negatedAnswer} ${tailEs}` : negatedAnswer;

  /*
   * Which Russian verb the cue is built from.
   *
   * Usually the drilled verb's own translation, but a frame may borrow another
   * one: Russian changes the verb to suit the object where Spanish does not,
   * so "hacer preguntas" is «задавать вопросы» and "hacer la cena" is
   * «готовить ужин». Without this the cue read «Я делаю вопросы».
   */
  const ruVerb: RuVerbSource = (frame?.ruVerb && RU_VERB_ALIASES[frame.ruVerb]) || verb;
  const ruTail = (isPast && frame?.ruTailPast) || tailRu;
  const negWord = ruVerb.ruNegative && (isPast ? ruVerb.ruNegative.past : ruVerb.ruNegative.present);

  const ruSentence = [
    ruSubjectForm(ruVerb, card.person),
    // A verb may carry its own negation instead of the plain particle:
    // possession is «У меня нет времени», never «У меня не есть времени».
    negative && !negWord ? "не" : null,
    negative && negWord
      ? negWord
      : isPast
        ? ruPastForm(ruVerb, card.person)
        : ruPresentForm(ruVerb, card.person),
    ruTail,
  ]
    .filter(Boolean)
    .join(" ");

  const prompt =
    (question ? `${ruSentence}?` : ruSentence) +
    (RU_PERSON_NOTE[card.person] ? ` ${RU_PERSON_NOTE[card.person]}` : "");

  // The whole sentence with the answer already in place, shown once the card is
  // answered: the point of the drill is the sentence, not the ending alone.
  const esSentence = question
    ? `¿${pronoun} ${sentence}?`
    : `${pronoun} ${sentence}`;

  /*
   * Whether the Russian is the task or the reward.
   *
   * When the Spanish sentence is already on screen — pronoun, infinitive and
   * complement all visible — printing the translation above it turns the card
   * into pure ending-matching: nothing has to be understood. So the Russian is
   * held back until the answer is in, and reading the sentence becomes part of
   * the exercise. Only `produce`, where nothing Spanish is shown, needs it up
   * front, because there it is the whole question.
   */
  const spanishIsVisible = kind !== "produce";

  const base: Exercise = {
    cardId: card.id,
    kind,
    prompt: spanishIsVisible ? "" : prompt,
    subject: { pronoun, head, tail },
    complement: tailEs,
    negative,
    question,
    answer,
    // The verb form alone is enough, but the full sentence is accepted too.
    accepted: [
      answer,
      negatedAnswer,
      `${pronoun.toLowerCase()} ${negatedAnswer}`,
      sentence,
      `${pronoun.toLowerCase()} ${sentence}`,
    ],
    speak: esSentence,
    // Shown after answering: the side the learner had to work out for herself.
    // The bare sentence: this one is shown after answering, purely to be read.
    translation: spanishIsVisible ? (question ? `${ruSentence}?` : ruSentence) : esSentence,
    ruleId: deck.ruleId,
    allowMissingSubject: true,
    hint: "*Достаточно ввести только глагол, местоимение необязательно",
  };

  if (kind === "choice") return { ...base, options };

  if (kind === "pronoun") {
    // The Spanish sentence is shown without its pronoun and the learner names
    // the person. Several persons share a form, so all of them are accepted.
    return {
      ...base,
      prompt: "Кто это делает?",
      subject: undefined,
      complement: undefined,
      // Bare sentence: the ¿ … ? wrapper is added by the screen, which also
      // slots the pronoun in once the card is answered.
      shown: sentence,
      answerEs: pronoun,
      // Here the Spanish is the question, so the translation shown afterwards
      // is the Russian one.
      translation: question ? `${ruSentence}?` : ruSentence,
      answer: pronounAnswerLabel(verb, card.tense, card.person, answer),
      pronounAnswers: russianPronounsForForm(verb, card.tense, answer),
      pronounAnswersEs: spanishPronounsForForm(verb, card.tense, answer),
      allowMissingSubject: false,
      hint: "*Можно ответить по-русски или по-испански, с диакритикой или без",
    };
  }

  if (kind === "produce") {
    // Nothing but the Russian sentence: the hardest step, and the one closest
    // to actually speaking.
    return {
      ...base,
      subject: undefined,
      complement: undefined,
      hint: "*Можно ввести только глагол или всю фразу целиком",
    };
  }

  return base;
}

/**
 * Every person this exact verb form could belong to.
 *
 * Worked out from the forms themselves rather than from a fixed table, because
 * which persons collide depends on the verb and the tense. `estás` is both tú
 * and vos; `eres` is only tú, since vos has `sos`. In the preterite vos merges
 * with tú for every verb. Marking one of two indistinguishable readings wrong
 * would be punishing the learner for the language's ambiguity.
 */
function personsSharingForm(verb: VerbEntry, tense: Tense, form: string): Person[] {
  return PERSONS.filter((person) => conjugate(verb, tense, person) === form);
}

/** Spanish pronouns for those persons; several map to the same form. */
const ES_PRONOUNS: Record<Person, string[]> = {
  yo: ["yo"],
  tu: ["tú"],
  vos: ["vos"],
  usted: ["usted"],
  // Every pronoun that shares the slot is accepted: by the form alone there is
  // no way to tell `él` from `usted`, so grading one of them wrong would be
  // grading the learner on something the sentence does not say.
  el: ["él", "ella", "usted"],
  nosotros: ["nosotros", "nosotras"],
  vosotros: ["vosotros", "vosotras"],
  ustedes: ["ustedes"],
  ellos: ["ellos", "ellas", "ustedes"],
};

function spanishPronounsForForm(verb: VerbEntry, tense: Tense, form: string): string[] {
  return [...new Set(personsSharingForm(verb, tense, form).flatMap((p) => ES_PRONOUNS[p]))];
}

/**
 * The Russian side. Case is what separates the polite «Вы» of usted and ustedes
 * from the plain «вы» of vosotros, so it is graded; everything else is not.
 */
function russianPronounsForForm(verb: VerbEntry, tense: Tense, form: string): string[] {
  const persons = personsSharingForm(verb, tense, form);
  const words = persons.flatMap((person) =>
    person === "el"
      ? ["Он", "Она", "Вы"]
      : person === "ellos"
        ? ["Они", "Вы"]
        : [RU_SUBJECT[person]],
  );
  return [...new Set(words)];
}

/**
 * The answer as shown after the card is answered.
 *
 * When a form belongs to more than one pronoun the alternatives are spelled
 * out — "Ты (tú, vos)" — because otherwise the learner sees a single answer
 * and concludes their equally correct one was wrong.
 */
function pronounAnswerLabel(
  verb: VerbEntry,
  tense: Tense,
  person: Person,
  form: string,
): string {
  const all = spanishPronounsForForm(verb, tense, form);
  // The card's own pronoun leads; the equally valid readings follow it.
  const own = ES_PRONOUNS[person];
  const options = [...own, ...all.filter((p) => !own.includes(p))];
  return `${RU_SUBJECT[person]} (${options.join(", ")})`;
}

/**
 * Gender and number of a noun or adjective, with the rule that usually predicts
 * it — and an explicit warning when this particular word breaks that rule.
 *
 * The -o/-a rule is the first thing a learner reaches for and it is right most
 * of the time, so the exceptions are worth calling out by name rather than
 * letting them quietly teach the wrong pattern.
 */
function grammarNoteFor(lex: LexemeEntry): string | undefined {
  // A hand-written warning always wins: it exists precisely because the
  // automatic reading of this word would be misleading.
  if (lex.note) return lex.note;
  if (lex.pos !== "noun" && lex.pos !== "adjective") return undefined;

  const article = lex.es.match(/^(el|la|los|las)\s/)?.[1];
  const word = article ? lex.es.slice(article.length + 1) : lex.es;
  const plural = article === "los" || article === "las" || /(?:s|es)$/.test(word);

  const gender =
    lex.gender ??
    (article === "el" || article === "los"
      ? "m"
      : article === "la" || article === "las"
        ? "f"
        : undefined);
  if (!gender) return undefined;

  const genderWord = gender === "f" ? "женский род" : "мужской род";
  const numberWord = plural ? "множественное число" : "единственное число";

  const endsInA = word.endsWith("a");
  const endsInO = word.endsWith("o");
  const followsRule = (endsInA && gender === "f") || (endsInO && gender === "m");

  const rule = "Слова на -a обычно женского рода, на -o — мужского.";

  if (followsRule) return `${genderWord}, ${numberWord}. ${rule}`;
  if (endsInA || endsInO) {
    return `${genderWord}, ${numberWord} — исключение: окончание подсказывает другой род. ${rule}`;
  }
  return `${genderWord}, ${numberWord}. Окончание рода не выдаёт, его нужно запомнить вместе с артиклем.`;
}

/** Stable per-card frame choice: the same card always gets the same sentence. */
const TENSE_ORDER: Tense[] = [
  "present",
  "preterite",
  "imperfect",
  "future",
  "conditional",
  "subjunctivePresent",
  "imperativeAffirmative",
];

/**
 * Which sentence a card gets.
 *
 * Spread by person rather than by a hash of the card id. A hash distributes
 * evenly only in the large; across the nine persons of a single verb it
 * collides constantly, which is why the same two adjectives kept coming back.
 * Walking the frames by person index guarantees that a verb with at least nine
 * frames never repeats a sentence within one tense, and the tense offset moves
 * the whole cycle so the past tense does not retell the present.
 */
function pickFrame(
  verbId: string,
  tense: Tense,
  person: Person,
  encounter: number,
  index: ContentIndex,
): SentenceFrame | null {
  const frames = index.framesByVerb.get(verbId);
  if (!frames || frames.length === 0) return null;

  const personIndex = Math.max(0, PERSONS.indexOf(person));
  const tenseOffset = Math.max(0, TENSE_ORDER.indexOf(tense)) * 3;
  /*
   * The encounter count advances the cursor, so a card returns with the next
   * sentence rather than the one it had last time. Every person walks the whole
   * frame list before anything comes back: nine persons over twelve frames give
   * a hundred and eight different sentences from one verb, and only then does
   * the cycle begin again.
   */
  /*
   * The encounter advances by a whole round, not by one.
   *
   * Seven persons consume seven frames per pass. Stepping by one made the next
   * pass start one frame later and overlap the previous one almost entirely —
   * the bank grew from ten tails to ninety-five and the first repeat still
   * landed on question fifteen. Stepping by the number of persons makes each
   * pass take a fresh block.
   */
  const step = PERSONS.length;
  return frames[(personIndex + tenseOffset + encounter * step) % frames.length];
}

/** Verbs with no frames yet fall back to their single complement, if any. */
function fallbackFrame(verb: VerbEntry): SentenceFrame | null {
  return verb.complement
    ? { verbId: verb.id, es: verb.complement.es, ru: verb.complement.ru, mood: "statement" }
    : null;
}

function buildVerbMeaning(
  card: Extract<CardRef, { kind: "verbMeaning" }>,
  deck: Deck,
  index: ContentIndex,
  kind: ExerciseKind,
): Exercise | null {
  const verb = index.verbs.get(card.verbId);
  if (!verb) return null;

  const pool = [...index.verbs.values()];

  if (kind === "translateToRu") {
    const answer = verb.ru[0];
    return {
      cardId: card.id,
      kind,
      prompt: "Что это значит?",
      shown: verb.infinitive,
      answer,
      accepted: [...verb.ru, verb.ru.join(", ")],
      options: shuffle([
        answer,
        ...sample(pool, 5, (v) => v.id === verb.id).map((v) => v.ru[0]),
      ]),
      speak: verb.infinitive,
      allMeanings: verb.ru,
      ruleId: deck.ruleId,
    };
  }

  const answer = verb.infinitive;
  const base: Exercise = {
    cardId: card.id,
    kind,
    // Only the first meaning is asked for; the rest appear after the answer.
    prompt: verb.ru[0],
    answer,
    accepted: [answer],
    speak: answer,
    allMeanings: verb.ru,
    ruleId: deck.ruleId,
  };

  if (kind === "listening") {
    return {
      ...base,
      prompt: "",
      // Either language: what is being tested is that the word was understood,
      // and typing its meaning proves that as well as spelling it does.
      accepted: [...base.accepted, ...verb.ru],
      translation: verb.ru.join(", "),
      hint: LISTEN_HINT,
    };
  }
  if (kind === "choice") {
    return {
      ...base,
      options: shuffle([
        answer,
        ...sample(pool, 5, (v) => v.id === verb.id).map((v) => v.infinitive),
      ]),
    };
  }
  return base;
}

function buildLexeme(
  card: Extract<CardRef, { kind: "lexeme" }>,
  deck: Deck,
  index: ContentIndex,
  kind: ExerciseKind,
): Exercise | null {
  const lex = index.lexemes.get(card.lexemeId);
  if (!lex) return null;

  // Distractors from the same part of speech keep the choice honest.
  const pool = [...index.lexemes.values()].filter((other) => other.pos === lex.pos);
  const fallbackPool = pool.length >= 6 ? pool : [...index.lexemes.values()];

  if (kind === "translateToRu") {
    const answer = lex.ru[0];
    return {
      cardId: card.id,
      kind,
      prompt: "Что это значит?",
      shown: lex.es,
      answer,
      // Any single listed meaning counts, and so does the whole list typed out.
      accepted: [...lex.ru, lex.ru.join(", ")],
      options: shuffle([
        answer,
        ...sample(fallbackPool, 5, (o) => o.id === lex.id).map((o) => o.ru[0]),
      ]),
      speak: lex.es,
      allMeanings: lex.ru,
      grammarNote: grammarNoteFor(lex),
      ruleId: deck.ruleId,
    };
  }

  const answer = lex.es;
  const base: Exercise = {
    cardId: card.id,
    kind,
    prompt: lex.ru[0],
    answer,
    accepted: [answer, ...(lex.spain ? [lex.spain] : [])],
    speak: answer,
    allMeanings: lex.ru,
    ruleId: deck.ruleId,
  };

  if (kind === "listening") {
    return {
      ...base,
      prompt: "",
      accepted: [...base.accepted, ...lex.ru],
      translation: lex.ru.join(", "),
      grammarNote: grammarNoteFor(lex),
      hint: LISTEN_HINT,
    };
  }
  if (kind === "choice") {
    return {
      ...base,
      options: shuffle([
        answer,
        ...sample(fallbackPool, 5, (o) => o.id === lex.id).map((o) => o.es),
      ]),
    };
  }
  return { ...base, grammarNote: grammarNoteFor(lex) };
}

function buildPhrase(
  card: Extract<CardRef, { kind: "phrase" }>,
  deck: Deck,
  index: ContentIndex,
  kind: ExerciseKind,
): Exercise | null {
  const phrase = index.phrases.get(card.phraseId);
  if (!phrase) return null;

  const answer = phrase.es;
  const base: Exercise = {
    cardId: card.id,
    kind,
    prompt: phrase.ru,
    answer,
    accepted: [answer, ...(phrase.spain ? [phrase.spain] : [])],
    speak: answer,
    ruleId: deck.ruleId,
    hint: phrase.literal ? `*Дословно: ${phrase.literal}` : undefined,
  };

  if (kind === "listening") {
    // The phrase's own "дословно" gloss would give the answer away here.
    return {
      ...base,
      prompt: "",
      accepted: [...base.accepted, phrase.ru],
      translation: phrase.ru,
      hint: LISTEN_PHRASE_HINT,
    };
  }

  if (kind === "choice") {
    // Same communicative function, so the options are genuinely confusable.
    const sameFunction = [...index.phrases.values()].filter((p) => p.fn === phrase.fn);
    const pool = sameFunction.length >= 4 ? sameFunction : [...index.phrases.values()];
    return {
      ...base,
      options: shuffle([
        answer,
        ...sample(pool, 3, (p) => p.id === phrase.id).map((p) => p.es),
      ]),
    };
  }

  return base;
}

