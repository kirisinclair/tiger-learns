import type { Person, RuVerbSource } from "./types";

/**
 * Russian prompt builder.
 *
 * The cue above the answer slot reads like natural Russian ("Я говорю"), which
 * means conjugating the Russian translation. Russian has two productive
 * patterns; this module applies them and lets individual verbs override the
 * result via `ruPresent` / `ruPastStem` when a stem mutation gets in the way.
 */

/**
 * Russian subject pronouns.
 *
 * Capitalisation is meaningful here and is the only thing separating two of the
 * forms in writing: `Вы` is the polite address (usted, ustedes), `вы` is the
 * plain plural (vosotros). Both take the same Russian verb form, so the case of
 * the first letter carries the distinction on its own.
 */
export const RU_SUBJECT: Record<Person, string> = {
  yo: "Я",
  tu: "Ты",
  vos: "Ты",
  usted: "Вы",
  el: "Он",
  nosotros: "Мы",
  vosotros: "вы",
  ustedes: "Вы",
  ellos: "Они",
};

/**
 * Clarifier appended to the Russian cue — but only where the pronoun alone
 * leaves the answer undecided.
 *
 * "Ты" covers both `tú` and `vos`, and those have different forms, so that
 * note earns its place. "Он" covering `usted` did not: the polite form is
 * spelled exactly like the third person, so the footnote explained a choice
 * the learner never had to make and only made the cue longer.
 */
export const RU_PERSON_NOTE: Partial<Record<Person, string>> = {
  vos: "(«ты», ЛА)",
  vosotros: "(многим, «ты»)",
};

/**
 * Which Russian verb form a Spanish person takes.
 * Polite `usted` is singular in Spanish but plural in Russian — "Вы говорите",
 * never "Вы говоришь" — so it maps onto the second-person plural.
 */
const RU_FORM_OF: Record<Person, Person> = {
  yo: "yo",
  tu: "tu",
  vos: "tu",
  usted: "vosotros",
  el: "el",
  nosotros: "nosotros",
  vosotros: "vosotros",
  ustedes: "vosotros",
  ellos: "ellos",
};

/** Verbs in -ить that nevertheless follow the first conjugation. */
const FIRST_CONJUGATION_EXCEPTIONS = new Set(["брить", "стелить", "зиждиться"]);

/** Verbs outside -ить that follow the second conjugation. */
const SECOND_CONJUGATION_EXCEPTIONS = new Set([
  "гнать",
  "держать",
  "дышать",
  "слышать",
  "смотреть",
  "видеть",
  "ненавидеть",
  "обидеть",
  "зависеть",
  "терпеть",
  "вертеть",
]);

/** Consonants after which "ю"/"я" become "у"/"а". */
const HUSHING = ["ж", "ч", "ш", "щ"];

function isSecondConjugation(infinitive: string): boolean {
  if (FIRST_CONJUGATION_EXCEPTIONS.has(infinitive)) return false;
  if (SECOND_CONJUGATION_EXCEPTIONS.has(infinitive)) return true;
  return infinitive.endsWith("ить");
}

function softEnding(stemEnd: string, soft: string, hard: string): string {
  return HUSHING.includes(stemEnd) ? hard : soft;
}

/**
 * Present-tense forms generated from the infinitive.
 * Correct for the large regular majority; irregular verbs supply `ruPresent`.
 */
/** Russian only distinguishes these six slots; Spanish persons map onto them. */
type RuSlot = "yo" | "tu" | "el" | "nosotros" | "vosotros" | "ellos";

function generatePresent(infinitive: string): Record<RuSlot, string> {
  const base = infinitive.replace(/ся$/, "");
  const reflexive = infinitive.endsWith("ся");
  const second = isSecondConjugation(base);
  const stem = second ? base.slice(0, -3) : base.slice(0, -2);
  const last = stem.slice(-1);

  const endings: Record<RuSlot, string> = second
    ? {
        yo: softEnding(last, "ю", "у"),
        tu: "ишь",
        el: "ит",
        nosotros: "им",
        vosotros: "ите",
        ellos: softEnding(last, "ят", "ат"),
      }
    : {
        yo: softEnding(last, "ю", "у"),
        tu: "ешь",
        el: "ет",
        nosotros: "ем",
        vosotros: "ете",
        ellos: softEnding(last, "ют", "ут"),
      };

  const result = {} as Record<RuSlot, string>;
  for (const slot of Object.keys(endings) as RuSlot[]) {
    const form = stem + endings[slot];
    // Reflexive verbs take -сь after a vowel and -ся after a consonant.
    result[slot] = reflexive ? form + (/[аеёиоуыэюя]$/.test(form) ? "сь" : "ся") : form;
  }
  return result;
}

/**
 * The subject of the Russian cue: normally the pronoun, but a verb may replace
 * it — possession is a place in Russian, so `tener` yields "У меня", not "Я".
 */
export function ruSubject(verb: RuVerbSource, person: Person): string {
  const slot = RU_FORM_OF[person] as RuSlot;
  return verb.ruSubject?.[slot] ?? RU_SUBJECT[person];
}

/** Russian present tense for one person, honouring per-verb overrides. */
export function ruPresent(verb: RuVerbSource, person: Person): string {
  const slot = RU_FORM_OF[person] as RuSlot;
  const override = verb.ruPresent?.[slot];
  // An empty override is meaningful, not missing: Russian has no present-tense
  // copula, so `ser` is rendered by leaving the verb out entirely — "Я врач",
  // not "Я являюсь врачом".
  if (override !== undefined) return override;
  return generatePresent(verb.ru[0])[slot];
}

/**
 * Russian past tense. It inflects for gender rather than person, so singular
 * subjects get the "(а)" suffix to stay correct for any learner.
 */
export function ruPast(verb: RuVerbSource, person: Person): string {
  const slot = RU_FORM_OF[person] as RuSlot;
  const override = verb.ruPast?.[slot];
  // Empty is meaningful here too: the possessive "есть" leaves the past copula
  // to the tail, where it can agree with the thing owned rather than the owner.
  if (override !== undefined) return override;

  const infinitive = verb.ru[0];
  const reflexive = infinitive.endsWith("ся");
  const base = infinitive.replace(/ся$/, "");
  const stem = verb.ruPastStem ?? base.slice(0, -2);
  const plural = slot === "nosotros" || slot === "ellos" || slot === "vosotros";

  if (plural) {
    return stem + "ли" + (reflexive ? "сь" : "");
  }
  if (slot === "el") {
    return stem + "л" + (reflexive ? "ся" : "");
  }
  // "я" and "ты" can be either gender.
  return reflexive ? `${stem}л(а)сь` : `${stem}л(а)`;
}

/** Subject plus verb, e.g. "Я говорю" — without the disambiguating note. */
export function ruSubjectAndVerb(verb: RuVerbSource, person: Person, past: boolean): string {
  const subject = ruSubject(verb, person);
  return `${subject} ${past ? ruPast(verb, person) : ruPresent(verb, person)}`;
}

/**
 * The full Russian cue shown above the answer slot.
 * For the four "you" forms a note is appended, since Russian cannot tell
 * usted from ustedes, or tú from vos, by the pronoun alone.
 */
export function ruPrompt(verb: RuVerbSource, person: Person, past: boolean): string {
  const note = RU_PERSON_NOTE[person];
  const core = ruSubjectAndVerb(verb, person, past);
  return note ? `${core} ${note}` : core;
}
