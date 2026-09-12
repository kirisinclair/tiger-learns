import type { Person, Tense, VerbEntry } from "./types";

/**
 * The seven slots the verb actually has.
 *
 * A person here is a *verb form*, not a pronoun. `él`, `ella` and `usted` all
 * take the same form and so are one slot; likewise `ellos`, `ellas` and
 * `ustedes`. `vos` earns its own slot because in the present tense its form
 * really does differ — everywhere else it falls back to `tú`.
 *
 * Splitting `usted` out as a tenth slot, as an earlier version did, made two
 * cards that ask for the same word. The politeness distinction is real, but it
 * belongs to the answer options, not to the conjugation table.
 */
export const PERSONS: Person[] = [
  "yo",
  "tu",
  "vos",
  "el",
  "nosotros",
  "vosotros",
  "ellos",
];

/** Subject pronoun printed next to the answer slot. */
export const PRONOUN: Record<Person, string> = {
  yo: "Yo",
  tu: "Tú",
  vos: "Vos",
  usted: "Usted",
  el: "Él",
  nosotros: "Nosotros",
  vosotros: "Vosotros",
  ustedes: "Ustedes",
  ellos: "Ellos",
};

/** Longer label used inside rule tables. */
export const PRONOUN_FULL: Record<Person, string> = {
  yo: "yo",
  tu: "tú",
  vos: "vos",
  usted: "usted",
  el: "él / ella / usted",
  nosotros: "nosotros",
  vosotros: "vosotros",
  ustedes: "ustedes",
  ellos: "ellos / ellas / ustedes",
};

/**
 * Persons that share their verb form with another person.
 * `usted` borrows the third-person singular, `ustedes` the plural.
 */
const FORM_ALIAS: Partial<Record<Person, Person>> = {
  usted: "el",
  ustedes: "ellos",
};

/**
 * Persons a learner is asked about — all six, `vosotros` included.
 *
 * Latin America uses `ustedes` rather than `vosotros` in speech, but the form
 * still has to be recognised: it fills books, films and anything from Spain. So
 * it is drilled regardless of which dialect is selected.
 */
export const PRACTICE_PERSONS: Person[] = PERSONS;

/**
 * Persons that actually carry their own ending in the tables below. The rest
 * are derived: `usted`/`ustedes` reuse a third-person ending, and `vos` has its
 * own rule rather than a table row.
 */
type BasePerson = "yo" | "tu" | "el" | "nosotros" | "vosotros" | "ellos";

type EndingTable = Record<BasePerson, string>;

const REGULAR: Record<Tense, Record<"ar" | "er" | "ir", EndingTable | null>> = {
  present: {
    ar: { yo: "o", tu: "as", el: "a", nosotros: "amos", vosotros: "áis", ellos: "an" },
    er: { yo: "o", tu: "es", el: "e", nosotros: "emos", vosotros: "éis", ellos: "en" },
    ir: { yo: "o", tu: "es", el: "e", nosotros: "imos", vosotros: "ís", ellos: "en" },
  },
  preterite: {
    ar: { yo: "é", tu: "aste", el: "ó", nosotros: "amos", vosotros: "asteis", ellos: "aron" },
    er: { yo: "í", tu: "iste", el: "ió", nosotros: "imos", vosotros: "isteis", ellos: "ieron" },
    ir: { yo: "í", tu: "iste", el: "ió", nosotros: "imos", vosotros: "isteis", ellos: "ieron" },
  },
  imperfect: {
    ar: { yo: "aba", tu: "abas", el: "aba", nosotros: "ábamos", vosotros: "abais", ellos: "aban" },
    er: { yo: "ía", tu: "ías", el: "ía", nosotros: "íamos", vosotros: "íais", ellos: "ían" },
    ir: { yo: "ía", tu: "ías", el: "ía", nosotros: "íamos", vosotros: "íais", ellos: "ían" },
  },
  subjunctivePresent: {
    ar: { yo: "e", tu: "es", el: "e", nosotros: "emos", vosotros: "éis", ellos: "en" },
    er: { yo: "a", tu: "as", el: "a", nosotros: "amos", vosotros: "áis", ellos: "an" },
    ir: { yo: "a", tu: "as", el: "a", nosotros: "amos", vosotros: "áis", ellos: "an" },
  },
  // Future and conditional attach to the whole infinitive, handled separately.
  future: { ar: null, er: null, ir: null },
  conditional: { ar: null, er: null, ir: null },
  imperativeAffirmative: { ar: null, er: null, ir: null },
};

const FUTURE_ENDINGS: EndingTable = {
  yo: "é",
  tu: "ás",
  el: "á",
  nosotros: "emos",
  vosotros: "éis",
  ellos: "án",
};

const CONDITIONAL_ENDINGS: EndingTable = {
  yo: "ía",
  tu: "ías",
  el: "ía",
  nosotros: "íamos",
  vosotros: "íais",
  ellos: "ían",
};

function group(verb: VerbEntry): "ar" | "er" | "ir" {
  return verb.group;
}

function stem(verb: VerbEntry): string {
  return verb.infinitive.slice(0, -2);
}

const ACCENTED_VOWEL: Record<string, string> = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };

/**
 * The `vos` present tense: drop the final -r of the infinitive, stress the last
 * vowel, add -s. hablar → hablás, comer → comés, vivir → vivís.
 *
 * Two things make it easier than `tú`: the stress falls on the ending, so the
 * stem never changes (vos podés, not vos "puedés"), and the rule has almost no
 * exceptions — only `ser` (sos) and `ir` (vas), which the verb data overrides.
 */
function vosPresent(verb: VerbEntry): string {
  const base = verb.infinitive.slice(0, -1);
  // One-syllable results take no written accent: dar → das, ver → ves.
  if (base.length <= 2) return `${base}s`;
  const lastVowel = base.slice(-1);
  return base.slice(0, -1) + (ACCENTED_VOWEL[lastVowel] ?? lastVowel) + "s";
}

/** Resolves a person onto the row that actually holds its ending. */
function baseOf(person: Person): BasePerson {
  const alias = FORM_ALIAS[person];
  if (alias) return alias as BasePerson;
  // Outside the present tense `vos` behaves exactly like `tú`.
  if (person === "vos") return "tu";
  return person as BasePerson;
}

/**
 * The regular form for one person, ignoring any overrides on the verb.
 * Exposed so the rule sheets can show "what it would be if it were regular".
 */
export function regularForm(verb: VerbEntry, tense: Tense, person: Person): string {
  if (person === "vos" && tense === "present") return vosPresent(verb);

  const base = baseOf(person);

  if (tense === "future") return verb.infinitive + FUTURE_ENDINGS[base];
  if (tense === "conditional") return verb.infinitive + CONDITIONAL_ENDINGS[base];
  if (tense === "imperativeAffirmative") return imperativeRegular(verb, person);

  const table = REGULAR[tense][group(verb)];
  if (!table) return verb.infinitive;
  return stem(verb) + table[base];
}

function imperativeRegular(verb: VerbEntry, person: Person): string {
  const g = group(verb);
  switch (person) {
    case "tu":
      // Same shape as third person singular present.
      return stem(verb) + (g === "ar" ? "a" : "e");
    case "vos":
      // The infinitive minus -r, stressed on the ending: hablá, comé, viví.
      return vosPresent(verb).slice(0, -1);
    case "vosotros":
      return stem(verb) + (g === "ar" ? "ad" : g === "er" ? "ed" : "id");
    default:
      // usted / nosotros / ustedes borrow the present subjunctive.
      return regularForm(verb, "subjunctivePresent", person);
  }
}

/**
 * The form actually taught: an explicit override when present, otherwise the
 * rule. Persons without their own row fall back to the one they share forms
 * with, so an irregular `él` form automatically covers `usted` too.
 */
export function conjugate(verb: VerbEntry, tense: Tense, person: Person): string {
  const direct = verb.forms?.[tense]?.[person];
  if (direct) return direct;

  // `vos` in the present has its own form and must not inherit the `tú` override.
  if (!(person === "vos" && tense === "present")) {
    const inherited = verb.forms?.[tense]?.[baseOf(person)];
    if (inherited) return inherited;
  }

  return regularForm(verb, tense, person);
}

/** Full table for one tense, in canonical person order. */
export function conjugationTable(
  verb: VerbEntry,
  tense: Tense,
): Array<{ person: Person; form: string }> {
  return PERSONS.map((person) => ({ person, form: conjugate(verb, tense, person) }));
}

/** True when the verb deviates from the regular pattern for this tense and person. */
export function isIrregularAt(verb: VerbEntry, tense: Tense, person: Person): boolean {
  const override = verb.forms?.[tense]?.[person];
  return override !== undefined && override !== regularForm(verb, tense, person);
}

/**
 * Splits a form into the part shared with the infinitive stem and the ending,
 * so the UI can tint the ending orange the way the reference screens do.
 */
export function splitEnding(infinitive: string, form: string): { head: string; tail: string } {
  let shared = 0;
  const max = Math.min(infinitive.length, form.length);
  while (shared < max && infinitive[shared] === form[shared]) shared += 1;
  // Never highlight the whole word: keep at least the first letter as the head.
  if (shared === 0) return { head: form, tail: "" };
  return { head: form.slice(0, shared), tail: form.slice(shared) };
}
