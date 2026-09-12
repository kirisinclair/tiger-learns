import type { Cefr, LexemeEntry, PartOfSpeech } from "../domain/types";
import { splitMeanings } from "./meanings";
import { BIG_NUMBER_LEXEMES, NUMBER_LEXEMES, ORDINAL_LEXEMES } from "./numbers";
import { FREQUENCY_LEXEMES } from "./frequency";
import { FREQUENCY_1000_LEXEMES } from "./frequency1000";
import { FREQUENCY_RANK } from "./frequencyOrder";

/**
 * Hand-curated vocabulary: the closed classes A1 needs (pronouns, question
 * words) and the thematic A2 inventory, organised along the topic list of the
 * Instituto Cervantes Plan Curricular for A1-A2.
 *
 * Words also present in the frequency list are not duplicated here — `rank` and
 * `cefr` are independent fields on one entry, so a word can belong to both the
 * frequency deck and a thematic deck at once.
 */

/** Compact authoring form: [spanish, russian, topic?, spainVariant?]. */
type Row = [es: string, ru: string, topic?: string, spain?: string];

function build(
  prefix: string,
  pos: PartOfSpeech,
  cefr: Cefr,
  rows: Row[],
  defaultTopic?: string,
): LexemeEntry[] {
  return rows.map(([es, ru, topic, spain]) => ({
    id: `${prefix}.${es.replace(/\s+/g, "_")}`,
    es,
    ru: splitMeanings(ru),
    pos,
    rank: null,
    cefr,
    topics: [topic ?? defaultTopic ?? prefix],
    ...(spain ? { spain } : {}),
  }));
}

/* -------------------------------------------------------------------------- */
/* A1 — closed classes                                                        */
/* -------------------------------------------------------------------------- */

export const PRONOUNS: LexemeEntry[] = build("pron", "pronoun", "A1", [
  ["yo", "я"],
  ["tú", "ты"],
  ["él", "он"],
  ["ella", "она"],
  ["usted", "вы (вежливо)"],
  ["nosotros", "мы"],
  ["nosotras", "мы (женский род)"],
  ["ellos", "они"],
  ["ellas", "они (женский род)"],
  ["ustedes", "вы (множественное число)"],
  ["me", "меня, мне"],
  ["te", "тебя, тебе"],
  ["lo", "его (о предмете, о событии)"],
  ["la", "её"],
  ["le", "ему, ей"],
  ["nos", "нас, нам"],
  ["los", "их (мужской род)"],
  ["las", "их (женский род)"],
  ["les", "им"],
  ["mi", "мой"],
  ["tu", "твой"],
  ["su", "его (перед словом)"],
  ["nuestro", "наш"],
  ["mío", "мой (самостоятельно)"],
  ["tuyo", "твой (самостоятельно)"],
  ["suyo", "его (самостоятельно)"],
  ["este", "этот"],
  ["esta", "эта"],
  ["esto", "это (вот это, рядом)"],
  ["ese", "тот"],
  ["aquel", "тот (далёкий)"],
  ["alguien", "кто-то"],
  ["nadie", "никто"],
  ["algo", "что-то"],
  ["nada", "ничто, ничего"],
  ["todo", "всё"],
  ["cada", "каждый"],
  ["otro", "другой"],
  ["mismo", "тот же самый"],
  ["conmigo", "со мной"],
  ["contigo", "с тобой"],
], "function");

export const QUESTION_WORDS: LexemeEntry[] = build("q", "interrogative", "A1", [
  ["qué", "что (в вопросе), какой"],
  ["quién", "кто"],
  ["quiénes", "кто (множественное число)"],
  ["cuál", "который, какой"],
  ["cuáles", "которые"],
  ["cómo", "как? (в вопросе)"],
  ["cuándo", "когда? (в вопросе)"],
  ["dónde", "где? (в вопросе)"],
  ["adónde", "куда"],
  ["de dónde", "откуда"],
  ["por qué", "почему"],
  ["para qué", "зачем"],
  ["cuánto", "сколько"],
  ["cuánta", "сколько (женский род)"],
  ["cuántos", "сколько (множественное число)"],
  ["cuántas", "сколько (женский род, мн. ч.)"],
  ["con quién", "с кем"],
  ["a quién", "кому, кого"],
  ["de quién", "чей"],
  ["qué tal", "как дела, как оно"],
], "function");

/* -------------------------------------------------------------------------- */
/* A2 — thematic vocabulary                                                   */
/* -------------------------------------------------------------------------- */

const FAMILY: Row[] = [
  ["la familia", "семья"],
  ["el padre", "отец"],
  ["la madre", "мать"],
  ["el hijo", "сын"],
  ["la hija", "дочь"],
  ["el hermano", "брат"],
  ["la hermana", "сестра"],
  ["el abuelo", "дедушка"],
  ["la abuela", "бабушка"],
  ["el nieto", "внук"],
  ["el tío", "дядя"],
  ["la tía", "тётя"],
  ["el primo", "двоюродный брат"],
  ["el sobrino", "племянник"],
  ["el esposo", "супруг"],
  ["la esposa", "жена"],
  ["el novio", "жених, парень (партнёр)"],
  ["la novia", "невеста, девушка (партнёр)"],
  ["el amigo", "друг"],
  ["la amiga", "подруга"],
  ["el vecino", "сосед"],
  ["el niño", "ребёнок, мальчик"],
  ["la niña", "девочка"],
  ["el bebé", "младенец"],
  ["el hombre", "мужчина"],
  ["la mujer", "женщина"],
  ["la gente", "люди"],
  ["el pariente", "родня, родственник"],
];

const HOME: Row[] = [
  ["la casa", "дом"],
  ["el departamento", "отдел, департамент", undefined, "el piso"],
  ["el cuarto", "комнатка", undefined, "la habitación"],
  ["la cocina", "кухня"],
  ["el baño", "ванная, туалет"],
  ["la sala", "гостиная", undefined, "el salón"],
  ["el dormitorio", "спальня"],
  ["la cama", "кровать"],
  ["la mesa", "стол"],
  ["la silla", "стул"],
  ["la puerta", "дверь"],
  ["la ventana", "окно"],
  ["el piso", "этаж, квартира"],
  ["la pared", "стена"],
  ["el techo", "потолок, крыша"],
  ["la llave", "ключ"],
  ["la luz", "свет"],
  ["el jardín", "сад"],
  ["el refrigerador", "холодильник", undefined, "la nevera"],
  ["la estufa", "плита", undefined, "la cocina"],
  ["el mueble", "мебель"],
  ["la escalera", "лестница"],
  ["el espejo", "зеркало"],
  ["la toalla", "полотенце"],
  ["el jabón", "мыло"],
  ["la basura", "мусор"],
];

const FOOD: Row[] = [
  ["la comida", "еда"],
  ["el desayuno", "завтрак"],
  ["el almuerzo", "обед"],
  ["la cena", "ужин"],
  ["el agua", "вода"],
  ["el pan", "хлеб"],
  ["la carne", "мясо"],
  ["el pollo", "курица"],
  ["el pescado", "рыба"],
  ["el arroz", "рис"],
  ["el huevo", "яйцо"],
  ["la leche", "молоко"],
  ["el queso", "сыр"],
  ["la fruta", "фрукт"],
  ["la manzana", "яблоко"],
  ["el plátano", "банан"],
  ["la naranja", "апельсин"],
  ["la verdura", "овощ"],
  ["la papa", "картофель", undefined, "la patata"],
  ["el tomate", "помидор"],
  ["la cebolla", "лук"],
  ["la ensalada", "салат"],
  ["la sopa", "суп"],
  ["el azúcar", "сахар"],
  ["la sal", "соль"],
  ["el aceite", "масло"],
  ["el jugo", "сок", undefined, "el zumo"],
  ["el café", "кофе"],
  ["el té", "чай"],
  ["la cerveza", "пиво"],
  ["el vino", "вино"],
  ["el postre", "десерт"],
  ["el helado", "мороженое"],
  ["el restaurante", "ресторан"],
  ["la cuenta", "счёт"],
  ["el mesero", "официант", undefined, "el camarero"],
  ["el plato", "тарелка, блюдо"],
  ["el vaso", "стакан"],
  ["la taza", "чашка"],
  ["el tenedor", "вилка"],
  ["el cuchillo", "нож"],
  ["la cuchara", "ложка"],
];

const CITY: Row[] = [
  ["la ciudad", "город"],
  ["la calle", "улица"],
  ["la plaza", "площадь"],
  ["el parque", "парк"],
  ["la tienda", "магазин"],
  ["el mercado", "рынок"],
  ["el banco", "банк"],
  ["el hospital", "больница"],
  ["la farmacia", "аптека"],
  ["la escuela", "школа"],
  ["la iglesia", "церковь"],
  ["el museo", "музей"],
  ["el cine", "кинотеатр"],
  ["el hotel", "отель"],
  ["el aeropuerto", "аэропорт"],
  ["la estación", "станция, вокзал"],
  ["el carro", "автомобиль (ЛА)", undefined, "el coche"],
  ["el camión", "грузовик, автобус"],
  ["el autobús", "автобус"],
  ["el metro", "метро"],
  ["el tren", "поезд"],
  ["el avión", "самолёт"],
  ["la bicicleta", "велосипед"],
  ["el taxi", "такси"],
  ["el boleto", "билет", undefined, "el billete"],
  ["el camino", "дорога, путь"],
  ["la esquina", "угол улицы"],
  ["el semáforo", "светофор"],
  ["el puente", "мост"],
  ["la playa", "пляж"],
];

const WORK_STUDY: Row[] = [
  ["el trabajo", "работа"],
  ["la oficina", "офис"],
  ["el jefe", "начальник"],
  ["el compañero", "коллега"],
  ["la reunión", "собрание, совещание"],
  ["el sueldo", "зарплата"],
  ["la empresa", "предприятие, фирма"],
  ["el cliente", "клиент"],
  ["la clase", "урок, класс"],
  ["el maestro", "учитель", undefined, "el profesor"],
  ["el alumno", "ученик"],
  ["la universidad", "университет"],
  ["el examen", "экзамен"],
  ["la tarea", "задание, домашняя работа"],
  ["el libro", "книга"],
  ["el cuaderno", "тетрадь"],
  ["la pluma", "ручка", undefined, "el bolígrafo"],
  ["el lápiz", "карандаш"],
  ["la carrera", "специальность, карьера"],
  ["el título", "диплом"],
];

const HEALTH: Row[] = [
  ["el cuerpo", "тело"],
  ["la cabeza", "голова"],
  ["el ojo", "глаз"],
  ["la boca", "рот"],
  ["la nariz", "нос"],
  ["la oreja", "ухо"],
  ["el pelo", "волос, шерсть"],
  ["la mano", "рука (кисть)"],
  ["el brazo", "рука (от плеча)"],
  ["la pierna", "нога"],
  ["el pie", "ступня"],
  ["el corazón", "сердце"],
  ["el estómago", "живот, желудок"],
  ["la espalda", "спина"],
  ["el diente", "зуб"],
  ["la salud", "здоровье"],
  ["el dolor", "боль"],
  ["la fiebre", "температура, жар"],
  ["la gripe", "грипп"],
  ["el médico", "врач"],
  ["la medicina", "медицина, лекарство"],
  ["la receta", "рецепт"],
  ["la cita", "приём, встреча"],
];

const CLOTHES: Row[] = [
  ["la ropa", "одежда"],
  ["la camisa", "рубашка"],
  ["la camiseta", "футболка"],
  ["el pantalón", "брюки"],
  ["el vestido", "платье"],
  ["la falda", "юбка"],
  ["el zapato", "туфля, ботинок"],
  ["el abrigo", "пальто"],
  ["la chaqueta", "куртка"],
  ["el sombrero", "шляпа"],
  ["el suéter", "свитер"],
  ["el calcetín", "носок"],
  ["la bolsa", "сумка"],
  ["el precio", "цена"],
  ["la talla", "размер одежды"],
  ["el descuento", "скидка"],
  ["la caja", "касса, коробка"],
  ["la tarjeta", "карточка, открытка"],
  ["el efectivo", "наличные"],
  ["el cambio", "сдача, обмен"],
];

const TIME_WEATHER: Row[] = [
  ["el día", "день"],
  ["la semana", "неделя"],
  ["el mes", "месяц"],
  ["el año", "год"],
  ["la hora", "час"],
  ["el minuto", "минута"],
  ["la mañana", "утро"],
  ["la tarde", "вечер, вторая половина дня"],
  ["la noche", "ночь"],
  ["hoy", "сегодня"],
  ["ayer", "вчера"],
  ["mañana", "завтра"],
  ["ahora", "сейчас"],
  ["siempre", "всегда"],
  ["nunca", "никогда"],
  ["temprano", "рано"],
  ["tarde", "вечер, вторая половина дня"],
  ["lunes", "понедельник"],
  ["martes", "вторник"],
  ["miércoles", "среда"],
  ["jueves", "четверг"],
  ["viernes", "пятница"],
  ["sábado", "суббота"],
  ["domingo", "воскресенье"],
  // Времена года. В испанском пишутся со строчной буквы, как и месяцы.
  ["la primavera", "весна"],
  ["el verano", "лето"],
  ["el otoño", "осень"],
  ["el invierno", "зима"],
  ["en verano", "летом"],
  ["en invierno", "зимой"],
  ["la estación del año", "время года"],
  // Месяцы: в словаре их не было совсем, хотя даты без них не сказать.
  ["enero", "январь"],
  ["febrero", "февраль"],
  ["marzo", "март"],
  ["abril", "апрель"],
  ["mayo", "май"],
  ["junio", "июнь"],
  ["julio", "июль"],
  ["agosto", "август"],
  ["septiembre", "сентябрь"],
  ["octubre", "октябрь"],
  ["noviembre", "ноябрь"],
  ["diciembre", "декабрь"],
  // Отрезки времени длиннее месяца.
  ["el trimestre", "квартал, триместр"],
  ["el semestre", "полугодие, семестр"],
  ["el fin de semana", "выходные"],
  ["la quincena", "две недели, полмесяца"],
  ["la década", "десятилетие"],
  ["el siglo", "век"],
  ["la fecha", "дата"],
  ["el calendario", "календарь"],
  ["el mes pasado", "в прошлом месяце"],
  ["la semana que viene", "на следующей неделе"],
  ["el tiempo", "погода, время"],
  ["el sol", "солнце"],
  ["la lluvia", "дождь"],
  ["el viento", "ветер"],
  ["la nieve", "снег"],
  ["el frío", "холод"],
  ["el calor", "жара"],
  ["la nube", "облако"],
];

const FEELINGS: Row[] = [
  ["feliz", "счастливый"],
  ["triste", "грустный"],
  ["cansado", "усталый"],
  ["enojado", "злой", undefined, "enfadado"],
  ["contento", "довольный"],
  ["preocupado", "обеспокоенный"],
  ["nervioso", "нервный"],
  ["tranquilo", "спокойный"],
  ["aburrido", "скучающий, скучный"],
  ["emocionado", "взволнованный"],
  ["asustado", "испуганный"],
  ["sorprendido", "удивлённый"],
  ["orgulloso", "гордый"],
  ["celoso", "ревнивый"],
  ["amable", "любезный"],
  ["simpático", "симпатичный, милый"],
  ["serio", "серьёзный (о человеке)"],
  ["divertido", "весёлый"],
  ["inteligente", "умный"],
  ["valiente", "смелый"],
  ["tímido", "застенчивый"],
  ["perezoso", "ленивый"],
];

const DESCRIPTION: Row[] = [
  ["grande", "большой"],
  ["pequeño", "маленький"],
  ["nuevo", "новый"],
  ["viejo", "старый"],
  ["bueno", "хороший"],
  ["malo", "плохой"],
  ["largo", "длинный"],
  ["corto", "короткий"],
  ["alto", "высокий"],
  ["bajo", "низкий"],
  ["caro", "дорогой"],
  ["barato", "дешёвый"],
  ["fácil", "лёгкий"],
  ["difícil", "трудный"],
  ["limpio", "чистый (не грязный)"],
  ["sucio", "грязный"],
  ["rápido", "быстрый"],
  ["lento", "медленный"],
  ["fuerte", "сильный"],
  ["débil", "слабый"],
  ["lleno", "наполненный"],
  ["vacío", "пустой"],
  ["bonito", "хорошенький, симпатичный"],
  ["feo", "уродливый"],
  ["blanco", "белый"],
  ["negro", "чёрный"],
  ["rojo", "красный"],
  ["azul", "синий"],
  ["verde", "зелёный"],
  ["amarillo", "жёлтый"],
  ["gris", "серый"],
  ["café", "коричневый", undefined, "marrón"],
];

/**
 * Situational sets: not "words about health" but "words you need in the room".
 * A theme built around one errand is worth more than a tidy semantic field,
 * because the whole set gets used in a single half hour.
 */
const DOCTOR_VISIT: Row[] = [
  ["la cita", "запись на приём"],
  ["el turno", "талон, очередь"],
  ["el consultorio", "кабинет врача"],
  ["la sala de espera", "зал ожидания"],
  ["el seguro", "страховка"],
  ["el síntoma", "симптом"],
  ["me duele", "у меня болит"],
  ["el dolor de cabeza", "головная боль"],
  ["la tos", "кашель"],
  ["el resfriado", "простуда"],
  ["la alergia", "аллергия"],
  ["la presión", "давление"],
  ["el análisis", "анализ"],
  ["la radiografía", "рентген"],
  ["la inyección", "укол"],
  ["la pastilla", "таблетка"],
  ["el jarabe", "сироп"],
  ["el tratamiento", "курс лечения"],
  ["la urgencia", "неотложная помощь"],
  ["el ayuno", "натощак"],
  ["la vacuna", "прививка"],
  ["el embarazo", "беременность"],
];

const MIGRATION_OFFICE: Row[] = [
  ["la migración", "миграционная служба"],
  ["el trámite", "оформление, процедура"],
  ["la ventanilla", "окошко в учреждении"],
  ["la solicitud", "заявление"],
  ["el formulario", "бланк, анкета"],
  ["el requisito", "требование"],
  ["el documento", "документ"],
  ["el pasaporte", "паспорт"],
  ["la visa", "виза", undefined, "el visado"],
  ["el permiso", "разрешение"],
  ["la residencia", "вид на жительство"],
  ["la ciudadanía", "гражданство"],
  ["el extranjero", "иностранец"],
  ["el domicilio", "адрес проживания"],
  ["la firma", "подпись"],
  ["el sello", "печать, штамп"],
  ["la copia", "копия"],
  ["el comprobante", "квитанция, подтверждение"],
  ["la entrevista", "собеседование"],
  ["la huella", "отпечаток пальца"],
  ["la prórroga", "продление"],
  ["el vencimiento", "окончание срока"],
  ["la multa", "штраф"],
  ["el plazo", "срок"],
];

const TECH_MONEY: Row[] = [
  ["la computadora", "компьютер", undefined, "el ordenador"],
  ["el celular", "мобильный телефон", undefined, "el móvil"],
  ["el teléfono", "телефон"],
  ["el internet", "интернет"],
  ["el correo", "почта"],
  ["el mensaje", "сообщение"],
  ["la contraseña", "пароль"],
  ["la pantalla", "экран"],
  ["el archivo", "файл"],
  ["la red", "сеть"],
  ["el dinero", "деньги"],
  ["el peso", "песо"],
  ["la cuenta bancaria", "банковский счёт"],
  ["el pago", "платёж"],
  ["la deuda", "долг"],
];

/**
 * Verb-plus-preposition patterns and the `tener` idioms.
 *
 * These are not words and not quite phrases: they are slots. Knowing
 * `empezar a` means every verb in the dictionary can follow it, so one entry
 * buys more than any single sentence could.
 */
const CONSTRUCTIONS: Row[] = [
  ["hay que", "надо (безлично)"],
  ["tener que", "быть должным"],
  ["ir a", "собираться что-то делать"],
  ["volver a", "сделать снова"],
  ["empezar a", "начинать (что-то делать)"],
  ["aprender a", "учиться чему-то"],
  ["salir a", "выйти чтобы"],
  ["querer decir", "иметь в виду"],
  ["tener miedo", "бояться"],
  ["tener razón", "быть правым"],
  ["tener hambre", "быть голодным"],
  ["tener sentido", "иметь смысл"],
  ["ser bueno en", "хорошо уметь"],
  ["ser malo en", "плохо уметь"],
  ["quedarse despierto", "не ложиться спать"],
  ["quedarse dormido", "заснуть"],
  ["ir de paseo", "идти на прогулку"],
  ["salir a comer", "выйти поесть"],
  ["tomar algo", "выпить чего-нибудь"],
  ["irse a casa", "идти домой"],
];

/** Words for placing things in time — the commonest source of vagueness. */
const TIME_EXTRA: Row[] = [
  ["temprano", "рано"],
  ["anoche", "прошлой ночью"],
  ["una vez", "однажды"],
  ["para siempre", "навсегда"],
  ["a tiempo", "вовремя"],
  ["pronto", "скоро"],
  ["antes", "до, раньше"],
  ["después", "после"],
  ["todavía", "ещё, до сих пор"],
  ["hace", "тому назад"],
  ["durante", "в течение"],
  ["dentro de", "через (о времени)"],
  ["los lunes", "по понедельникам"],
  ["último", "последний"],
  ["la última vez", "в прошлый раз"],
  ["el año pasado", "в прошлом году"],
  ["durar", "длиться"],
];

const VERBS_EXTRA: Row[] = [
  ["andar", "ходить, гулять"],
  ["quedarse", "оставаться"],
  ["levantarse", "вставать"],
  ["mudarse", "переезжать"],
  ["relajarse", "расслабляться"],
  ["mostrar", "показывать, предъявлять"],
  ["prometer", "обещать"],
  ["contar", "считать, рассказывать"],
  ["preferir", "предпочитать"],
  ["tocar", "играть на инструменте, трогать"],
  ["hornear", "печь"],
  ["fregar", "мыть пол, мыть посуду"],
  ["odiar", "ненавидеть"],
  ["montar en bicicleta", "кататься на велосипеде"],
  ["hacer senderismo", "ходить в походы"],
  ["hacer rafting", "сплавляться по реке"],
];

const DESC_EXTRA: Row[] = [
  ["despierto", "бодрствующий"],
  ["emocionante", "волнующий"],
  ["gracioso", "забавный"],
  ["extraño", "чужой, незнакомый"],
  ["pesado", "тяжёлый (по весу)"],
  ["ligero", "лёгкий по весу"],
  ["calmado", "успокоившийся"],
  ["igual", "такой же, всё равно"],
  ["mismo", "тот же самый, сам"],
  ["tan", "настолько, так"],
  ["juntos", "вместе"],
  ["mejor", "лучше, лучший"],
  ["peor", "хуже, худший"],
];

/** Small words that hold a sentence together. */
const CONNECTORS: Row[] = [
  ["los demás", "остальные"],
  ["alguien", "кто-то"],
  ["en vez de", "вместо"],
  ["junto a", "рядом с"],
  ["así", "так"],
  ["así que", "так что"],
  ["por cierto", "кстати"],
  ["en realidad", "на самом деле"],
  ["aquí mismo", "прямо здесь"],
  ["cosas así", "и тому подобное"],
  ["sobre", "о, на, над"],
  ["dentro", "внутрь, в течение"],
];

const NOUNS_EXTRA: Row[] = [
  ["el puente", "мост"],
  ["el gimnasio", "спортзал"],
  ["el lugar", "место"],
  ["el sentido", "смысл"],
  ["la enfermera", "медсестра"],
  ["el extranjero", "заграница, иностранец"],
  ["el hockey sobre hielo", "хоккей на льду"],
  ["el libro policíaco", "детектив"],
];

export const A2_TOPIC_LEXEMES: LexemeEntry[] = [
  ...build("fam", "noun", "A2", FAMILY, "people"),
  ...build("home", "noun", "A2", HOME, "daily"),
  ...build("food", "noun", "A2", FOOD, "food"),
  ...build("city", "noun", "A2", CITY, "city"),
  ...build("work", "noun", "A2", WORK_STUDY, "people"),
  ...build("health", "noun", "A2", HEALTH, "health"),
  ...build("shop", "noun", "A2", CLOTHES, "daily"),
  ...build("time", "noun", "A2", TIME_WEATHER, "time"),
  ...build("feel", "adjective", "A2", FEELINGS, "traits"),
  ...build("desc", "adjective", "A2", DESCRIPTION, "traits"),
  ...build("tech", "noun", "A2", TECH_MONEY, "daily"),
  ...build("doc", "noun", "A2", DOCTOR_VISIT, "health"),
  ...build("mig", "noun", "A2", MIGRATION_OFFICE, "documents"),
  ...build("con", "phrase", "A2", CONSTRUCTIONS, "function"),
  ...build("time2", "adverb", "A2", TIME_EXTRA, "time"),
  // Verb meanings belong in the "Глаголы" tab, not among the topics.
  ...build("verb2", "verb", "A2", VERBS_EXTRA, "verbmeanings"),
  ...build("desc2", "adjective", "A2", DESC_EXTRA, "traits"),
  ...build("conn", "conjunction", "A2", CONNECTORS, "function"),
  ...build("noun2", "noun", "A2", NOUNS_EXTRA, "daily"),
];

/**
 * Vocabulary above A2, stored but not yet taught.
 *
 * Kept out of the active pool on purpose: these need grammar the course has not
 * reached. Wiring them in later is a matter of adding the array to
 * `ALL_LEXEMES` — nothing else has to change.
 */
export const B1_LEXEMES: LexemeEntry[] = [
  ...build("b1", "verb", "B1", [
    ["jubilarse", "уходить на пенсию"],
    ["suponer", "предполагать"],
    ["caber", "вмещаться"],
    ["soler", "обычно делать что-то"],
    ["avergonzarse", "стыдиться"],
  ], "pending"),
  ...build("b1x", "phrase", "B1", [
    ["tener ganas de", "хотеть, не терпится"],
    ["pasarla bien", "хорошо проводить время"],
    ["dar vergüenza", "вызывать стыд"],
    ["lo que sea", "что угодно, всё равно"],
    ["de alguna manera", "как-то, в каком-то роде"],
    ["definitivamente", "определённо"],
  ], "pending"),
  ...build("b1n", "noun", "B1", [
    ["la ficción", "художественная литература"],
    ["la jardinería", "садоводство"],
    ["la delincuencia", "преступность"],
  ], "pending"),
];

/** The bare word, without its article, used to spot the same word twice. */
function headword(entry: LexemeEntry): string {
  return entry.es.replace(/^(el|la|los|las)\s+/i, "").toLowerCase();
}

/**
 * One word, one card.
 *
 * The frequency list and the thematic lists overlap heavily — `casa` is both
 * the 37th most common word and a member of "дом". Keeping them as separate
 * entries meant the learner drilled the same word twice under two unrelated
 * cards, and finishing it in one place did nothing for the other.
 *
 * Here they are folded together by headword: the first occurrence keeps its id
 * (so its progress survives), and later ones only contribute the fields it was
 * missing — a frequency rank, an extra topic, a gender. Which section a word is
 * reached through becomes a matter of filtering, not of storage.
 */
function mergeByHeadword(groups: LexemeEntry[][]): LexemeEntry[] {
  const byWord = new Map<string, LexemeEntry>();

  for (const group of groups) {
    for (const entry of group) {
      const key = `${headword(entry)}|${entry.pos}`;
      const existing = byWord.get(key);

      if (!existing) {
        byWord.set(key, { ...entry, topics: [...(entry.topics ?? [])] });
        continue;
      }

      // Keep the richer headword: "la casa" carries the gender, "casa" does not.
      if (entry.es.length > existing.es.length) existing.es = entry.es;
      existing.rank = existing.rank ?? entry.rank;
      existing.gender = existing.gender ?? entry.gender;
      existing.spain = existing.spain ?? entry.spain;
      existing.example = existing.example ?? entry.example;
      // The lower CEFR wins: if a word is needed at A1, it is an A1 word.
      if (entry.cefr === "A1") existing.cefr = "A1";

      for (const topic of entry.topics ?? []) {
        if (!existing.topics?.includes(topic)) existing.topics?.push(topic);
      }
      for (const meaning of entry.ru) {
        if (!existing.ru.includes(meaning)) existing.ru.push(meaning);
      }
    }
  }

  return [...byWord.values()];
}

/**
 * Second pass: the same word, filed twice under different parts of speech.
 *
 * `mergeByHeadword` keys on headword *and* part of speech, and that is right —
 * `café` the drink and `café` the colour are two words, as are `seguro`
 * "safe" and `el seguro` "insurance". But it also let one word through twice
 * whenever two files disagreed about its label: `ahora` was an adverb in the
 * frequency list and a noun in the time topic, so it became two cards with the
 * same meaning, and a drill asking for "сейчас" accepted one of them and
 * marked the other wrong.
 *
 * The distinguishing test is the meaning, not the label. Two entries spelled
 * the same and glossed the same are one word however they were tagged.
 */
function foldSameMeaning(entries: LexemeEntry[]): LexemeEntry[] {
  const byKey = new Map<string, LexemeEntry>();

  for (const entry of entries) {
    const key = `${headword(entry)}|${entry.ru[0].toLowerCase()}`;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, entry);
      continue;
    }

    // The first one keeps its id, so the surviving card keeps its history.
    for (const topic of entry.topics ?? []) {
      if (!existing.topics?.includes(topic)) existing.topics?.push(topic);
    }
    for (const meaning of entry.ru) {
      if (!existing.ru.includes(meaning)) existing.ru.push(meaning);
    }
    existing.rank = existing.rank ?? entry.rank;
    existing.gender = existing.gender ?? entry.gender;
    if (entry.cefr === "A1") existing.cefr = "A1";
  }

  return [...byKey.values()];
}

const MERGED_LEXEMES: LexemeEntry[] = mergeByHeadword([
  // Frequency first, so the frequency id is the one that survives a merge and
  // the more objective ordering drives the dictionary.
  FREQUENCY_LEXEMES,
  // The other half of the top thousand: words the dictionary had no entry for.
  FREQUENCY_1000_LEXEMES,
  PRONOUNS,
  QUESTION_WORDS,
  NUMBER_LEXEMES,
  ORDINAL_LEXEMES,
  BIG_NUMBER_LEXEMES,
  A2_TOPIC_LEXEMES,
]);

/**
 * Rank is stamped here, not written into each file.
 *
 * It used to be a property of one source: words that arrived from the
 * frequency file had one, words that arrived as pronouns or question words
 * did not, and the frequency section consequently listed `cielo` but not
 * `dónde`. Rank is a fact about a word, though, not about which file it was
 * typed in — so it is applied to the merged dictionary, once, from a single
 * order.
 */
export const ALL_LEXEMES: LexemeEntry[] = foldSameMeaning(MERGED_LEXEMES).map((entry) => ({
  ...entry,
  rank: FREQUENCY_RANK.get(headword(entry)) ?? null,
}));

/**
 * Topic ids paired with the Russian titles the deck list shows.
 *
 * Kept deliberately few and large. Twenty topics of twenty words each looked
 * tidy but studied badly: every one was over in two sittings, and choosing
 * between them cost more attention than the words did. A topic worth opening
 * has enough in it to come back to.
 */
export const TOPIC_TITLES: Record<string, string> = {
  /*
   * Служебные слова идут первыми: без вопросительных слов, местоимений и
   * связок не построить ни одной фразы, а частотного ранга у них нет, так что
   * иначе они в разделе слов просто не показываются.
   */
  function: "Служебные слова и обороты",
  numbers: "Числа",
  daily: "Повседневная жизнь: дом, покупки, деньги, техника",
  food: "Еда, напитки, кафе",
  city: "Город, транспорт, дорога",
  health: "Здоровье, тело, врач",
  documents: "Документы и учреждения",
  people: "Люди, работа, учёба",
  time: "Время, даты, погода",
  traits: "Описание, чувства, характер",
};
