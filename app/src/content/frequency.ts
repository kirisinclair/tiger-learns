import type { LexemeEntry, PartOfSpeech } from "../domain/types";
import { splitMeanings } from "./meanings";

/**
 * Frequency dictionary — Latin-American Spanish.
 *
 * Ordering follows the consensus of publicly available frequency lists built on
 * spoken-heavy corpora (OpenSubtitles-derived lists, RAE CREA, and the
 * Spain/Latin-America split corpus behind Davies' frequency dictionary). Ranks
 * are ordinal positions in this curated list rather than raw corpus counts:
 * different corpora disagree in the details, and what matters for study order
 * is the neighbourhood, not the exact number.
 *
 * Where usage splits, the Latin-American form is the headword and the
 * peninsular one is recorded in `spain`.
 *
 * `rank` and `cefr` are independent, so a word can sit in the frequency deck
 * and a thematic A2 deck at the same time without being duplicated.
 */

/** Compact authoring form: [spanish, russian, part of speech, spainVariant?]. */
type FreqRow = [es: string, ru: string, pos: PartOfSpeech, spain?: string];

const ROWS: FreqRow[] = [
  ["que", "что, который", "conjunction"],
  ["de", "из, от, о", "preposition"],
  ["no", "нет, не", "adverb"],
  ["a", "к, в (куда), на (куда)", "preposition"],
  ["y", "и", "conjunction"],
  ["en", "в (где), на (где), внутри", "preposition"],
  ["por", "по, из-за, через", "preposition"],
  ["con", "с", "preposition"],
  ["para", "для, чтобы", "preposition"],
  ["se", "себя, -ся", "pronoun"],
  ["lo", "его (о предмете, о событии)", "pronoun"],
  ["si", "если", "conjunction"],
  ["pero", "но", "conjunction"],
  ["más", "больше, более", "adverb"],
  ["ya", "уже", "adverb"],
  ["muy", "очень", "adverb"],
  ["bien", "хорошо", "adverb"],
  ["todo", "всё, весь", "pronoun"],
  ["así", "так", "adverb"],
  ["aquí", "здесь", "adverb"],
  ["ahora", "сейчас", "adverb"],
  ["también", "тоже, также", "adverb"],
  ["porque", "потому что", "conjunction"],
  ["cuando", "когда", "conjunction"],
  ["como", "как", "conjunction"],
  ["sólo", "только", "adverb"],
  ["cosa", "вещь", "noun"],
  ["vez", "раз", "noun"],
  ["tiempo", "время", "noun"],
  ["día", "день", "noun"],
  ["vida", "жизнь", "noun"],
  ["hombre", "мужчина, человек", "noun"],
  ["mujer", "женщина", "noun"],
  ["casa", "дом", "noun"],
  ["señor", "господин, сеньор", "noun"],
  // Not a noun to be learned with an article: as "спасибо" it is a fixed
  // expression, and the noun behind it is plural — "las gracias", never "la
  // gracias". Left bare so the card teaches the word people actually say.
  ["gracias", "спасибо", "other"],
  ["favor", "одолжение", "noun"],
  ["verdad", "правда", "noun"],
  ["noche", "ночь, вечер", "noun"],
  ["mundo", "мир", "noun"],
  ["padre", "отец", "noun"],
  ["madre", "мать", "noun"],
  ["hijo", "сын", "noun"],
  ["amigo", "друг", "noun"],
  ["gente", "люди", "noun"],
  ["niño", "ребёнок", "noun"],
  ["trabajo", "работа", "noun"],
  ["dinero", "деньги", "noun"],
  ["mano", "рука (кисть)", "noun"],
  ["lugar", "место", "noun"],
  ["momento", "момент", "noun"],
  ["año", "год", "noun"],
  ["parte", "часть", "noun"],
  ["forma", "форма, способ", "noun"],
  ["caso", "случай", "noun"],
  ["problema", "проблема", "noun"],
  ["idea", "идея", "noun"],
  ["nombre", "имя", "noun"],
  ["agua", "вода", "noun"],
  ["país", "страна", "noun"],
  ["ciudad", "город", "noun"],
  ["calle", "улица", "noun"],
  ["puerta", "дверь", "noun"],
  ["coche", "машина", "noun", "coche"],
  ["cuerpo", "тело", "noun"],
  ["cabeza", "голова", "noun"],
  ["ojo", "глаз", "noun"],
  ["papel", "бумага, роль", "noun"],
  ["palabra", "слово", "noun"],
  ["historia", "история", "noun"],
  ["razón", "правота, разум", "noun"],
  ["manera", "способ", "noun"],
  ["hora", "час", "noun"],
  ["semana", "неделя", "noun"],
  ["mes", "месяц", "noun"],
  ["mañana", "утро, завтра", "noun"],
  ["tarde", "вечер, вторая половина дня", "noun"],
  ["fin", "конец", "noun"],
  ["número", "число, номер", "noun"],
  ["grupo", "группа", "noun"],
  ["punto", "точка, пункт", "noun"],
  ["nivel", "уровень", "noun"],
  ["estado", "состояние, штат", "noun"],
  ["grande", "большой", "adjective"],
  ["pequeño", "маленький", "adjective"],
  ["bueno", "хороший", "adjective"],
  ["malo", "плохой", "adjective"],
  ["nuevo", "новый", "adjective"],
  ["viejo", "старый", "adjective"],
  ["mejor", "лучший", "adjective"],
  ["peor", "худший", "adjective"],
  ["primero", "первый", "adjective"],
  ["último", "последний", "adjective"],
  ["mismo", "тот же самый", "adjective"],
  ["propio", "собственный", "adjective"],
  ["cierto", "определённый, верный", "adjective"],
  ["posible", "возможный", "adjective"],
  ["importante", "важный", "adjective"],
  ["diferente", "непохожий, различный", "adjective"],
  ["seguro", "уверенный, безопасный", "adjective"],
  ["difícil", "трудный", "adjective"],
  ["fácil", "лёгкий", "adjective"],
  ["largo", "длинный", "adjective"],
  ["alto", "высокий", "adjective"],
  ["bajo", "низкий", "adjective"],
  ["joven", "молодой", "adjective"],
  ["feliz", "счастливый", "adjective"],
  ["libre", "свободный", "adjective"],
  // Not "один": that is the numeral `uno`, and a card asking for "один" has two
  // right answers and accepts one of them.
  ["solo", "одинокий, в одиночку", "adjective"],
  ["todos", "все", "pronoun"],
  ["algunos", "некоторые", "pronoun"],
  ["mucho", "много", "adverb"],
  ["poco", "мало", "adverb"],
  ["demasiado", "слишком", "adverb"],
  ["bastante", "достаточно, довольно", "adverb"],
  ["casi", "почти", "adverb"],
  ["siempre", "всегда", "adverb"],
  ["nunca", "никогда", "adverb"],
  ["todavía", "ещё, всё ещё", "adverb"],
  ["entonces", "тогда, значит", "adverb"],
  ["luego", "потом", "adverb"],
  ["después", "после", "adverb"],
  ["antes", "раньше, до", "adverb"],
  ["pronto", "скоро", "adverb"],
  ["despacio", "медленно", "adverb"],
  ["quizás", "может быть", "adverb"],
  ["tal vez", "может статься", "adverb"],
  ["claro", "конечно, ясно", "adverb"],
  ["allí", "там (подальше)", "adverb"],
  ["ahí", "вон там (рядом)", "adverb"],
  ["allá", "там (далеко)", "adverb"],
  ["arriba", "наверху", "adverb"],
  ["abajo", "внизу", "adverb"],
  ["adentro", "внутри", "adverb", "dentro"],
  ["afuera", "снаружи", "adverb", "fuera"],
  ["cerca", "близко", "adverb"],
  ["lejos", "далеко", "adverb"],
  ["juntos", "вместе", "adverb"],
  ["nada", "ничего", "pronoun"],
  ["nadie", "никто", "pronoun"],
  ["algo", "что-то", "pronoun"],
  ["alguien", "кто-то", "pronoun"],
  ["cada", "каждый", "pronoun"],
  ["otro", "другой", "pronoun"],
  ["tanto", "столько", "pronoun"],
  ["sin", "без", "preposition"],
  ["sobre", "о, на, над", "preposition"],
  ["entre", "между", "preposition"],
  ["hasta", "до", "preposition"],
  ["desde", "от, начиная с", "preposition"],
  ["durante", "во время", "preposition"],
  ["contra", "против", "preposition"],
  ["hacia", "в сторону, по направлению к", "preposition"],
  ["según", "согласно", "preposition"],
  ["aunque", "хотя", "conjunction"],
  ["mientras", "пока, в то время как", "conjunction"],
  ["además", "кроме того", "conjunction"],
  ["sino", "а, но", "conjunction"],
  ["pues", "ну, ведь", "conjunction"],
  ["ni", "ни", "conjunction"],
  ["o", "или", "conjunction"],
  ["escuela", "школа", "noun"],
  ["libro", "книга", "noun"],
  ["clase", "класс, урок", "noun"],
  ["fuego", "огонь", "noun"],
  ["muerte", "смерть", "noun"],
  ["amor", "любовь", "noun"],
  ["miedo", "страх", "noun"],
  ["suerte", "удача", "noun"],
  ["culpa", "вина", "noun"],
  ["ayuda", "помощь", "noun"],
  ["cuenta", "счёт", "noun"],
  ["fuerza", "сила", "noun"],
  ["voz", "голос", "noun"],
  ["cara", "лицо", "noun"],
  ["corazón", "сердце", "noun"],
  ["sangre", "кровь", "noun"],
  ["comida", "еда", "noun"],
  ["cama", "кровать", "noun"],
  ["mesa", "стол", "noun"],
  ["ropa", "одежда", "noun"],
  ["luz", "свет", "noun"],
  ["sol", "солнце", "noun"],
  ["cielo", "небо", "noun"],
  ["tierra", "земля", "noun"],
  ["mar", "море", "noun"],
  ["perro", "собака", "noun"],
  ["gato", "кот", "noun"],
  ["carro", "автомобиль (ЛА)", "noun", "coche"],
  ["camión", "грузовик", "noun"],
  ["papá", "папа", "noun"],
  ["mamá", "мама", "noun"],
  ["chico", "мальчик, парнишка", "noun"],
  ["chica", "девушка (молодая)", "noun"],
  ["jefe", "начальник", "noun"],
  ["policía", "полиция, полицейский", "noun"],
  ["doctor", "доктор", "noun"],
  ["equipo", "команда, оборудование", "noun"],
  ["juego", "игра", "noun"],
  ["película", "фильм", "noun"],
  ["música", "музыка", "noun"],
  ["fiesta", "праздник, вечеринка", "noun"],
  ["viaje", "поездка", "noun"],
];

/**
 * Gender of every noun in the list above.
 *
 * Nouns are always practised with their article — "la casa", not "casa" —
 * because the article is the only reliable carrier of gender, and a noun
 * learned without it has to be relearned later with every adjective it meets.
 */
const NOUN_GENDER: Record<string, "m" | "f"> = {
  cosa: "f", vez: "f", tiempo: "m", día: "m", vida: "f", hombre: "m", mujer: "f",
  casa: "f", señor: "m", favor: "m", verdad: "f", noche: "f",
  mundo: "m", padre: "m", madre: "f", hijo: "m", amigo: "m", gente: "f",
  niño: "m", trabajo: "m", dinero: "m", mano: "f", lugar: "m", momento: "m",
  año: "m", parte: "f", forma: "f", caso: "m", problema: "m", idea: "f",
  nombre: "m", agua: "f", país: "m", ciudad: "f", calle: "f", puerta: "f",
  coche: "m", cuerpo: "m", cabeza: "f", ojo: "m", papel: "m", palabra: "f",
  historia: "f", razón: "f", manera: "f", hora: "f", semana: "f", mes: "m",
  mañana: "f", tarde: "f", fin: "m", número: "m", grupo: "m", punto: "m",
  nivel: "m", estado: "m", escuela: "f", libro: "m", clase: "f", fuego: "m",
  muerte: "f", amor: "m", miedo: "m", suerte: "f", culpa: "f", ayuda: "f",
  cuenta: "f", fuerza: "f", voz: "f", cara: "f", corazón: "m", sangre: "f",
  comida: "f", cama: "f", mesa: "f", ropa: "f", luz: "f", sol: "m", cielo: "m",
  tierra: "f", mar: "m", perro: "m", gato: "m", carro: "m", camión: "m",
  papá: "m", mamá: "f", chico: "m", chica: "f", jefe: "m", policía: "f",
  doctor: "m", equipo: "m", juego: "m", película: "f", música: "f",
  fiesta: "f", viaje: "m",
};

/**
 * Notes for words whose Russian translation is misleading on its own.
 *
 * Russian "в" covers two different Spanish prepositions, and translating it
 * back the wrong way is one of the most persistent beginner mistakes — so the
 * pair is spelled out rather than left to be inferred from three glosses.
 */
const NOTES: Record<string, string> = {
  a: "Предлог направления — куда. Voy a la casa — иду К дому, В дом. Если речь о том, где ты находишься, нужен en: estoy en la casa — я В доме.",
  en: "Предлог места — где, внутри. Estoy en la casa — я в доме. Для направления нужен a: voy a la casa.",
  de: "Принадлежность и происхождение: la casa de Ana — дом Аны, soy de Perú — я из Перу.",
  por: "Причина и «через»: gracias por todo — спасибо за всё, paso por aquí — прохожу здесь. Не путать с para.",
  para: "Цель и адресат: es para ti — это для тебя, salgo para México — уезжаю в Мексику (с целью).",
};

/**
 * Feminine nouns beginning with a stressed "a" take the masculine article in
 * the singular: "el agua", never "la agua". The noun stays feminine.
 */
const TAKES_EL_DESPITE_FEMININE = new Set(["agua"]);

function withArticle(word: string, gender: "m" | "f"): string {
  const article = gender === "m" || TAKES_EL_DESPITE_FEMININE.has(word) ? "el" : "la";
  return `${article} ${word}`;
}

export const FREQUENCY_LEXEMES: LexemeEntry[] = ROWS.map(([es, ru, pos, spain], i) => {
  const gender = NOUN_GENDER[es];
  const headword = pos === "noun" && gender ? withArticle(es, gender) : es;

  return {
    // The id is built from the bare word, so adding an article later does not
    // orphan the learner's progress on that card.
    id: `freq.${es.replace(/\s+/g, "_")}`,
    es: headword,
    ru: splitMeanings(ru),
    pos,
    ...(NOTES[es] ? { note: NOTES[es] } : {}),
    rank: i + 1,
    // The top of any frequency list is core A1; the tail shades into A2.
    cefr: i < 120 ? "A1" : "A2",
    topics: ["frequency"],
    ...(gender ? { gender } : {}),
    ...(spain && spain !== es ? { spain } : {}),
  };
});

/** How many blocks of 100 the frequency deck list should offer. */
/**
 * Words per block.
 *
 * Hundreds rather than fifties: fifty was over before it felt like anything,
 * and a vocabulary cut into pieces that small never adds up to a number worth
 * saying out loud. A block is still learned in tens.
 */
export const FREQUENCY_BLOCK_SIZE = 100;

export const FREQUENCY_TOTAL = FREQUENCY_LEXEMES.length;
