import type { GrammarRule } from "../domain/types";

/**
 * Grammar rules shown behind "Посмотреть грамматическое правило" and, in their
 * one-line `short` form, immediately after a wrong answer.
 *
 * Latin-American usage throughout: `ustedes` rather than `vosotros`, and the
 * pretérito indefinido as the default past tense.
 */

/**
 * All six persons, `vosotros` included.
 *
 * Latin America says `ustedes`, not `vosotros`, but the form is drilled and so
 * has to be in the tables: it fills books, subtitles and anything from Spain,
 * and a table missing a row teaches that the row does not exist.
 */
const PERSON_COLUMN = [
  "yo",
  "tú",
  "vos",
  "usted",
  "él / ella",
  "nosotros",
  "vosotros",
  "ustedes",
  "ellos / ellas",
];

/**
 * Endings are authored once per grammatical slot; the persons that share a slot
 * are expanded here. `vos` differs only in the present tense, so every other
 * table simply repeats the `tú` ending for it.
 */
function expandPersons(
  [yo, tu, el, nosotros, vosotros, ellos]: string[],
  vos: string = tu,
): string[] {
  return [yo, tu, vos, el, el, nosotros, vosotros, ellos, ellos];
}

/** Builds a person × verb-group table from one column of endings per group. */
function endingsTable(...columns: string[][]): GrammarRule["blocks"][number] {
  return {
    type: "table",
    head: ["Лицо", "-ar", "-er", "-ir"],
    rows: PERSON_COLUMN.map((person, row) => [person, ...columns.map((col) => col[row])]),
  };
}

export const RULES: GrammarRule[] = [
  {
    id: "rule.you",
    title: "Четыре способа сказать «вы»",
    short: "tú и vos — на «ты», usted — вежливо одному, vosotros и ustedes — нескольким.",
    blocks: [
      {
        type: "text",
        text: "В русском есть «ты» и «Вы». В испанском таких форм четыре, и выбор не стилистический: от него зависит форма глагола.",
      },
      {
        type: "table",
        head: ["Форма", "Кому", "По-русски", "Глагол берёт форму"],
        rows: [
          ["tú", "одному, на «ты»", "ты", "своя, 2-е лицо ед. ч."],
          ["vos", "одному, на «ты»", "ты", "своя, только в настоящем времени"],
          ["usted", "одному, вежливо", "Вы", "как у él — 3-е лицо ед. ч."],
          ["vosotros", "нескольким, на «ты»", "вы", "своя, 2-е лицо мн. ч."],
          ["ustedes", "нескольким, вежливо", "Вы", "как у ellos — 3-е лицо мн. ч."],
        ],
      },
      {
        type: "text",
        text: "Главная ловушка для русскоязычных: usted и ustedes — это «Вы», но глагол при них стоит в третьем лице, как будто ты говоришь «он» и «они». Usted habla — дословно «Вы говорит».",
      },
      {
        type: "examples",
        items: [
          { es: "Tú hablas español.", ru: "Ты говоришь по-испански." },
          { es: "Vos hablás español.", ru: "Ты говоришь по-испански. (Аргентина, Уругвай)" },
          { es: "Usted habla español.", ru: "Вы говорите по-испански. (одному, вежливо)" },
          { es: "Vosotros habláis español.", ru: "вы говорите по-испански. (многим, ES)" },
          { es: "Ustedes hablan español.", ru: "Вы говорите по-испански. (нескольким)" },
        ],
      },
      {
        type: "text",
        text: "Где что употребляют. Дальше ES — это Испания, ЛА — Латинская Америка. Vosotros — только ES; в ЛА вместо него всегда ustedes, и оно там звучит и вежливо, и по-дружески. Vos — обычная форма в Аргентине, Уругвае, Парагвае и Центральной Америке; в Мексике и на Карибах его нет, там tú. Usted работает везде.",
      },
      {
        type: "text",
        text: "Как образуется vos в настоящем времени: у инфинитива убирается -r, ударение переносится на последний слог, добавляется -s. hablar → hablás, comer → comés, vivir → vivís. Корень при этом не меняется, даже там, где у tú он меняется: vos podés, а не «puedés». Исключений всего два: ser → sos и ir → vas.",
      },
      {
        type: "text",
        text: "Во всех остальных временах vos ведёт себя как tú: vos hablaste, vos hablabas, vos hablarás.",
      },
      {
        type: "text",
        text: "В подсказках приложения «Вы» с большой буквы означает usted или ustedes, а «вы» с маленькой — vosotros. Это единственное, чем они различаются на письме по-русски.",
      },
    ],
  },
  {
    id: "rule.present.regular",
    title: "Настоящее время: правильные глаголы",
    short: "Отбрасываем -ar/-er/-ir и добавляем окончание лица.",
    blocks: [
      {
        type: "text",
        text: "У правильных глаголов основа не меняется. Убираем окончание инфинитива и добавляем окончание нужного лица. Три группы различаются только гласной в окончании.",
      },
      endingsTable(
        expandPersons(["-o", "-as", "-a", "-amos", "-áis", "-an"], "-ás"),
        expandPersons(["-o", "-es", "-e", "-emos", "-éis", "-en"], "-és"),
        expandPersons(["-o", "-es", "-e", "-imos", "-ís", "-en"], "-ís"),
      ),
      {
        type: "text",
        text: "Обрати внимание: у -er и -ir окончания совпадают везде, кроме форм nosotros (-emos против -imos) и vosotros (-éis против -ís).",
      },
      {
        type: "examples",
        items: [
          { es: "Yo hablo español.", ru: "Я говорю по-испански." },
          { es: "Nosotros comemos en casa.", ru: "Мы едим дома." },
          { es: "Ellos viven en México.", ru: "Они живут в Мексике." },
        ],
      },
      {
        type: "text",
        text: "Про vosotros. В ЛА эта форма не используется: для «вы» во множественном числе берут ustedes и форму третьего лица множественного числа — ustedes hablan, а не vosotros habláis. Но узнавать её нужно, потому что она повсюду в книгах, фильмах и любой речи из ES, поэтому в тренировке она есть.",
      },
    ],
  },
  {
    id: "rule.preterite.regular",
    title: "Прошедшее время: Pretérito Indefinido",
    short: "Законченное действие в прошлом: hablé, comí, viví.",
    blocks: [
      {
        type: "text",
        text: "Pretérito Indefinido — основное прошедшее время в ЛА. Оно описывает законченное действие: «я сделал и всё». В ES в тех же случаях часто говорят he hablado, но в ЛА это редкость.",
      },
      endingsTable(
        expandPersons(["-é", "-aste", "-ó", "-amos", "-asteis", "-aron"]),
        expandPersons(["-í", "-iste", "-ió", "-imos", "-isteis", "-ieron"]),
        expandPersons(["-í", "-iste", "-ió", "-imos", "-isteis", "-ieron"]),
      ),
      {
        type: "text",
        text: "У -er и -ir окончания в этом времени полностью совпадают. У -ar форма nosotros (hablamos) выглядит так же, как в настоящем времени — различать помогает контекст.",
      },
      {
        type: "examples",
        items: [
          { es: "Ayer hablé con el jefe.", ru: "Вчера я говорил с начальником." },
          { es: "Comimos a las dos.", ru: "Мы поели в два часа." },
        ],
      },
      {
        type: "text",
        text: "Орфография: глаголы на -car, -gar, -zar меняют написание в форме yo, чтобы сохранить звук — buscar → busqué, llegar → llegué, empezar → empecé.",
      },
    ],
  },
  {
    id: "rule.ser.estar.present",
    title: "Ser и Estar в настоящем времени",
    short: "Ser — постоянное свойство, estar — состояние и местоположение.",
    blocks: [
      {
        type: "table",
        head: ["Лицо", "ser", "estar"],
        rows: [
          ["yo", "soy", "estoy"],
          ["tú", "eres", "estás"],
          ["vos", "sos", "estás"],
          ["usted", "es", "está"],
          ["él / ella", "es", "está"],
          ["nosotros", "somos", "estamos"],
          ["vosotros", "sois", "estáis"],
          ["ustedes", "son", "están"],
          ["ellos / ellas", "son", "están"],
        ],
      },
      {
        type: "text",
        text: "Ser отвечает на вопрос «кто/что это и какой он вообще»: профессия, происхождение, характер, время и дата. Estar отвечает на вопрос «где он и как ему сейчас»: местоположение, самочувствие, временное состояние.",
      },
      {
        type: "examples",
        items: [
          { es: "Soy de la Luna.", ru: "Я с Луны. (происхождение — ser)" },
          { es: "Estoy en casa.", ru: "Я дома. (местоположение — estar)" },
          { es: "Él es aburrido.", ru: "Он скучный человек. (свойство)" },
          { es: "Él está aburrido.", ru: "Ему сейчас скучно. (состояние)" },
        ],
      },
    ],
  },
  {
    id: "rule.ser.estar.past",
    title: "Ser и Estar в прошедшем времени",
    short: "Ser → fui, estar → estuve; оба неправильные.",
    blocks: [
      {
        type: "table",
        head: ["Лицо", "ser (fui)", "estar (estuve)"],
        rows: [
          ["yo", "fui", "estuve"],
          ["tú", "fuiste", "estuviste"],
          ["él / ella / usted", "fue", "estuvo"],
          ["nosotros", "fuimos", "estuvimos"],
          ["vosotros", "fuisteis", "estuvisteis"],
          ["ellos / ellas / ustedes", "fueron", "estuvieron"],
        ],
      },
      {
        type: "text",
        text: "Формы ser в прошедшем времени полностью совпадают с формами ir («идти»). Fui значит и «я был», и «я пошёл» — какое именно значение, показывает контекст.",
      },
      {
        type: "examples",
        items: [
          { es: "Fui médico.", ru: "Я был врачом." },
          { es: "Fui al mercado.", ru: "Я пошёл на рынок." },
          { es: "Estuve en casa todo el día.", ru: "Я был дома весь день." },
        ],
      },
      {
        type: "text",
        text: "Есть и второе прошедшее — imperfecto (era, estaba). Оно описывает не событие, а фон: «раньше я был», «тогда там было тихо».",
      },
    ],
  },
  {
    id: "rule.present.irregular",
    title: "Неправильные глаголы в настоящем времени",
    short: "Смена гласной в основе или особая форма yo.",
    blocks: [
      {
        type: "text",
        text: "Неправильность обычно одного из двух видов, и оба легко узнать в лицо.",
      },
      {
        type: "text",
        text: "1. Смена гласной в основе. Она происходит там, где на основу падает ударение: во всех формах, кроме nosotros и vosotros — в них ударение уходит на окончание. Отсюда «ботинок»: изменённые формы стоят по краям таблицы, а две средние остаются правильными.",
      },
      {
        type: "table",
        head: ["Тип", "Пример", "yo", "tú", "nosotros", "vosotros"],
        rows: [
          ["e → ie", "pensar", "pienso", "piensas", "pensamos", "pensáis"],
          ["o → ue", "poder", "puedo", "puedes", "podemos", "podéis"],
          ["e → i", "pedir", "pido", "pides", "pedimos", "pedís"],
          ["u → ue", "jugar", "juego", "juegas", "jugamos", "jugáis"],
        ],
      },
      {
        type: "text",
        text: "2. Особая форма только для yo, остальные лица правильные: tener → tengo, hacer → hago, poner → pongo, salir → salgo, conocer → conozco, ver → veo, saber → sé, dar → doy.",
      },
      {
        type: "text",
        text: "Некоторые глаголы совмещают оба: tener → tengo, но tienes, tiene. Venir и decir ведут себя так же.",
      },
    ],
  },
  {
    id: "rule.preterite.irregular",
    title: "Неправильные глаголы в прошедшем времени",
    short: "Своя основа плюс общий набор безударных окончаний.",
    blocks: [
      {
        type: "text",
        text: "У неправильных глаголов в Indefinido меняется основа, а окончания у всех одинаковые и, в отличие от правильных, без ударения на конце: -e, -iste, -o, -imos, -isteis, -ieron.",
      },
      {
        type: "table",
        head: ["Инфинитив", "Основа", "yo", "él", "vosotros"],
        rows: [
          ["tener", "tuv-", "tuve", "tuvo", "tuvisteis"],
          ["estar", "estuv-", "estuve", "estuvo", "estuvisteis"],
          ["poder", "pud-", "pude", "pudo", "pudisteis"],
          ["poner", "pus-", "puse", "puso", "pusisteis"],
          ["saber", "sup-", "supe", "supo", "supisteis"],
          ["querer", "quis-", "quise", "quiso", "quisisteis"],
          ["venir", "vin-", "vine", "vino", "vinisteis"],
          ["hacer", "hic-", "hice", "hizo", "hicisteis"],
          ["decir", "dij-", "dije", "dijo", "dijisteis"],
          ["traer", "traj-", "traje", "trajo", "trajisteis"],
        ],
      },
      {
        type: "text",
        text: "Если основа заканчивается на -j (dij-, traj-), в форме ellos выпадает i: dijeron, trajeron, а не dijieron.",
      },
      {
        type: "text",
        text: "Отдельно стоят ser и ir: у обоих одна и та же форма — fui, fuiste, fue, fuimos, fuisteis, fueron.",
      },
    ],
  },
  {
    id: "rule.imperfect",
    title: "Pretérito Imperfecto",
    short: "Фон и привычка в прошлом: hablaba, comía.",
    blocks: [
      {
        type: "text",
        text: "Imperfecto описывает не событие, а фон: что происходило регулярно, как было устроено, каким всё было. По-русски это часто «раньше», «обычно», «бывало».",
      },
      {
        type: "table",
        head: ["Лицо", "-ar", "-er / -ir"],
        rows: [
          ["yo", "-aba", "-ía"],
          ["tú", "-abas", "-ías"],
          ["él / ella / usted", "-aba", "-ía"],
          ["nosotros", "-ábamos", "-íamos"],
          ["vosotros", "-abais", "-íais"],
          ["ellos / ellas / ustedes", "-aban", "-ían"],
        ],
      },
      {
        type: "text",
        text: "Неправильных всего три: ser (era), ir (iba), ver (veía).",
      },
      {
        type: "examples",
        items: [
          { es: "Cuando era niño, vivía en la Luna.", ru: "Когда я был маленьким, я жил на Луне." },
          { es: "Ayer comí a las dos.", ru: "Вчера я поел в два. (одно событие — indefinido)" },
        ],
      },
    ],
  },
  {
    id: "rule.future",
    title: "Futuro simple",
    short: "Окончание прибавляется к целому инфинитиву: hablaré.",
    blocks: [
      {
        type: "text",
        text: "Будущее время — самое простое в испанском: окончание добавляется не к основе, а к инфинитиву целиком, и оно одинаково для всех трёх групп.",
      },
      {
        type: "table",
        head: ["Лицо", "Окончание", "hablar", "comer"],
        rows: [
          ["yo", "-é", "hablaré", "comeré"],
          ["tú", "-ás", "hablarás", "comerás"],
          ["él / ella / usted", "-á", "hablará", "comerá"],
          ["nosotros", "-emos", "hablaremos", "comeremos"],
          ["vosotros", "-éis", "hablaréis", "comeréis"],
          ["ellos / ellas / ustedes", "-án", "hablarán", "comerán"],
        ],
      },
      {
        type: "text",
        text: "Неправильные глаголы меняют только основу, окончания те же: tener → tendré, poder → podré, hacer → haré, decir → diré, saber → sabré, poner → pondré, salir → saldré, querer → querré.",
      },
      {
        type: "text",
        text: "В разговорной речи ЛА будущее чаще выражают через ir a + инфинитив: voy a hablar — «я буду говорить».",
      },
    ],
  },
  {
    id: "rule.conditional",
    title: "Condicional simple",
    short: "«Бы»: к инфинитиву добавляется -ía.",
    blocks: [
      {
        type: "text",
        text: "Condicional соответствует русскому «бы»: что было бы, что хотелось бы, вежливая просьба. Строится так же, как будущее — от целого инфинитива, но с окончаниями imperfecto на -ía.",
      },
      {
        type: "table",
        head: ["Лицо", "Окончание", "hablar"],
        rows: [
          ["yo", "-ía", "hablaría"],
          ["tú", "-ías", "hablarías"],
          ["él / ella / usted", "-ía", "hablaría"],
          ["nosotros", "-íamos", "hablaríamos"],
          ["vosotros", "-íais", "hablaríais"],
          ["ellos / ellas / ustedes", "-ían", "hablarían"],
        ],
      },
      {
        type: "text",
        text: "Основы неправильных глаголов те же, что в будущем времени: tendría, podría, haría, diría.",
      },
      {
        type: "examples",
        items: [
          { es: "Me gustaría un café.", ru: "Я бы хотел кофе. (вежливая просьба)" },
          { es: "¿Podría ayudarme?", ru: "Не могли бы вы мне помочь?" },
        ],
      },
    ],
  },
  {
    id: "rule.vocab",
    title: "Как учить слова",
    short: "Слово повторяется тем реже, чем увереннее ты его вспоминаешь.",
    blocks: [
      {
        type: "text",
        text: "Каждое слово живёт по своему расписанию. Ответили правильно — интервал растёт: день, три дня, неделя, две недели, месяц. Ошиблись — слово вернётся в этой же сессии и интервал начнётся заново.",
      },
      {
        type: "text",
        text: "Тип задания тоже меняется. Новое слово сначала предлагается на выбор из вариантов, затем на перевод, а когда оно уже уверенно держится — на ввод с клавиатуры и на слух.",
      },
      {
        type: "text",
        text: "Испанские буквы с чёрточками можно не набирать: manana засчитается за mañana, esta за está. Правильное написание всегда показывается после ответа.",
      },
    ],
  },
  {
    id: "rule.phrases",
    title: "Как учить фразы",
    short: "Фраза запоминается целиком, разбирать её по словам не нужно.",
    blocks: [
      {
        type: "text",
        text: "Готовые фразы учатся блоком: их не собирают из грамматики, а достают из памяти целиком. Именно так их и использует носитель языка.",
      },
      {
        type: "text",
        text: "Фразы со скобками вида «Quiero...» — это шаблоны. В них подставляется любое подходящее слово, поэтому одна такая фраза даёт десятки высказываний.",
      },
      {
        type: "text",
        text: "Части пронумерованы по полезности: часть 1 — пятьдесят фраз, которые нужны раньше всего. Можно остановиться на любой части и всё равно владеть самым нужным.",
      },
    ],
  },
];

export const RULES_BY_ID = new Map(RULES.map((rule) => [rule.id, rule]));
