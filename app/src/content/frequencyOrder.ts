/**
 * The one true frequency order, across the whole dictionary.
 *
 * The problem this fixes: rank used to live only on words that came from the
 * frequency file, and everything reached through another door — pronouns,
 * question words, verbs — had no rank at all. So the frequency section listed
 * "cielo" and not "dónde", which is exactly backwards. Nobody says "sky" more
 * often than "where".
 *
 * A word is one entity with one card and one history, shown in whatever lists
 * match it. This file supplies the missing half of that idea: an order that
 * covers every entity, whichever file it was written in. Ranks are stamped onto
 * the existing entries by headword, so nothing is duplicated and no progress
 * moves.
 *
 * **Lemmas, not word forms.** The published lists count forms — `es`, `tengo`,
 * `dijo` and `estaba` all sit near the top — and cards for those would be
 * nonsense here, because conjugation is taught in its own section from the
 * infinitive. Every form is folded onto the word it belongs to, so `ser`
 * carries the weight of `es`, `son`, `era`, `fue` and `sido` together. That is
 * also why this order matches no published list exactly: published lists are
 * counting something else.
 *
 * Built from subtitle-derived frequency data (Wiktionary's Spanish subtitle
 * lists, about 27 million words), cross-checked against the Latin-American half
 * of Davies. Positions are ordinal and approximate by design: corpora disagree
 * in the details, and what matters for study order is the neighbourhood.
 *
 * **What is deliberately left out.**
 *  - Articles: `el`, `la`, `un`, `una`, `del`, `al` top every real list and are
 *    useless as cards. They are learned attached to the noun — the dictionary
 *    shows "la casa", not "casa" — so a card for "la" would drill a form that
 *    is never chosen on its own. The object pronouns spelled the same way are
 *    out for the same reason: on a card they read as the articles they mimic.
 *  - Swearing and the insult vocabulary around it. Subtitle corpora are full of
 *    it — one obscenity outranks `padre` — and none of it is what this app is
 *    for. Say the word and it goes back in.
 *  - Proper nouns and abbreviations: `dios`, `york`, `sr`, `dr`, `tv`.
 *  - Subtitle noise: `oh`, `eh`, `uh`, `ok`, and the misspellings that survive
 *    in scraped text (`aqui`, `asi`, `tambien`).
 *
 * Verbs are listed by infinitive and matched against the verb entries; every
 * other line is matched against a dictionary headword, ignoring any article.
 */
export const FREQUENCY_ORDER: string[] = [
  /* 1-100 — the skeleton: linkers, prepositions, pronouns, and the handful of
     verbs that carry grammar rather than meaning. */
  "que", "de", "no", "a", "y", "en", "ser", "lo", "por", "qué",
  "me", "te", "se", "con", "para", "mi", "estar", "si", "bien", "pero",
  "yo", "eso", "sí", "su", "tu", "aquí", "como", "le", "más", "esto",
  "ya", "todo", "este", "ir", "muy", "haber", "ahora", "algo", "tener", "nos",
  "tú", "nada", "cuando", "saber", "así", "poder", "cómo", "querer", "sólo", "gracias",
  "o", "él", "bueno", "hacer", "vez", "creer", "ella", "ese", "hola", "porque",
  "quién", "nunca", "dónde", "casa", "favor", "dos", "tan", "señor", "tiempo", "verdad",
  "mejor", "hombre", "usted", "mucho", "entonces", "sentir", "ahí", "ti", "vida", "ver",
  "alguien", "hasta", "sin", "mí", "solo", "año", "sobre", "decir", "uno", "siempre",
  "cosa", "también", "antes", "ni", "día", "noche", "nadie", "otro", "parecer", "nosotros",

  /* 101-200 — the everyday world: people, places, the commonest verbs of doing
     and of saying. */
  "poco", "padre", "trabajo", "gente", "mirar", "donde", "mismo", "hecho", "ellos", "pasar",
  "dinero", "hijo", "tal", "hablar", "seguro", "claro", "lugar", "mundo", "amigo", "esperar",
  "después", "momento", "desde", "fuera", "tipo", "mañana", "grande", "necesitar", "estado", "acuerdo",
  "papá", "gustar", "nuevo", "nombre", "tres", "menos", "deber", "mal", "conmigo", "madre",
  "hoy", "luego", "allí", "hora", "mujer", "importar", "contigo", "tarde", "parte", "aún",
  "cada", "tanto", "razón", "ustedes", "idea", "quizá", "cierto", "muerto", "salir", "policía",
  "realmente", "demasiado", "familia", "cabeza", "chica", "cariño", "lado", "allá", "entre", "minuto",
  "alguno", "serio", "cuidado", "amor", "puerta", "suerte", "rápido", "cuenta", "pues", "todavía",
  "hermano", "casi", "forma", "chico", "dentro", "contra", "auto", "camino", "ayuda", "primero",
  "hacia", "miedo", "adiós", "niño", "historia", "mientras", "ciudad", "cuánto", "esposa", "pronto",

  /* 201-300 */
  "cualquier", "viejo", "muerte", "mano", "loco", "problema", "guerra", "semana", "cuál", "volver",
  "caso", "agua", "entender", "persona", "capitán", "adelante", "listo", "junto", "único", "cerca",
  "seguir", "jefe", "manera", "feliz", "significar", "sangre", "fin", "bajo", "venir", "morir",
  "importante", "ojo", "escuchar", "entrar", "ninguno", "corazón", "atrás", "durante", "abajo", "hija",
  "dejar", "llegar", "señora", "suficiente", "doctor", "tierra", "cara", "siquiera", "suponer", "tomar",
  "equipo", "justo", "juego", "matar", "cinco", "cuándo", "pequeño", "conocer", "clase", "segundo",
  "aunque", "igual", "comida", "cuerpo", "encontrar", "fuerte", "vuelta", "realidad", "pregunta", "cuatro",
  "trabajar", "alto", "comer", "número", "dar", "oportunidad", "punto", "último", "afuera", "pensar",
  "difícil", "vivir", "paso", "malo", "vivo", "mayor", "fiesta", "medio", "arma", "vino",
  "mes", "cuarto", "escuela", "dólar", "tío", "posible", "fácil", "luz", "final", "lista",

  /* 301-400 */
  "hermana", "exactamente", "bastante", "seguridad", "acá", "teléfono", "perro", "fuego", "tampoco", "culpa",
  "adónde", "paz", "jugar", "recuerdo", "par", "joven", "pueblo", "caballero", "bebé", "lejos",
  "plan", "sentido", "dormir", "palabra", "correcto", "control", "país", "seis", "callar", "trato",
  "rey", "suceder", "muchacho", "jamás", "cama", "ayudar", "acerca", "cambio", "falta", "hospital",
  "presidente", "mil", "gusto", "general", "extraño", "coche", "peor", "perder", "nave", "cielo",
  "orden", "niña", "increíble", "además", "libro", "calle", "café", "especial", "perfecto", "buscar",
  "odio", "oficina", "libre", "agente", "llamar", "detrás", "real", "frente", "millón", "asesino",
  "sueño", "viaje", "probablemente", "resto", "lamentar", "avión", "ropa", "fuerza", "oír", "encima",
  "negro", "usar", "información", "secreto", "incluso", "boca", "dolor", "baño", "adentro", "profesor",
  "habitación", "daño", "tuyo", "noticia", "demás", "duro", "poner", "prueba", "tonto", "campo",

  /* 401-500 */
  "diez", "tranquilo", "asunto", "derecho", "placer", "ejército", "futuro", "llevar", "compañía", "sitio",
  "puesto", "atención", "sino", "cambiar", "error", "blanco", "raro", "mente", "sistema", "película",
  "ello", "negocio", "novia", "permiso", "sonar", "ocurrir", "oficial", "aire", "regresar", "grupo",
  "señorita", "música", "empezar", "diferente", "traje", "modo", "mensaje", "llamada", "pena", "largo",
  "piso", "foto", "médico", "accidente", "imposible", "línea", "propio", "barco", "ganar", "normal",
  "mitad", "tras", "lindo", "funcionar", "programa", "pagar", "centro", "basura", "situación", "encantar",
  "marido", "personal", "maestro", "hambre", "ataque", "pie", "conseguir", "gracioso", "derecha", "izquierda",
  "próximo", "pobre", "respuesta", "voz", "amiga", "vista", "salvo", "hotel", "temer", "señal",
  "pelo", "ayer", "nena", "servicio", "tren", "bonito", "edad", "ellas", "hermoso", "honor",
  "simplemente", "correr", "sol", "humano", "divertido", "sexo", "peligro", "mesa", "siguiente", "caja",

  /* 501-600 */
  "misión", "silencio", "regreso", "media", "oro", "enseguida", "prometer", "esposo", "norte", "jurar",
  "interesante", "terminar", "cita", "siete", "cumpleaños", "abogado", "alrededor", "cerebro", "llave", "santo",
  "necesario", "edificio", "ley", "verdadero", "pelea", "banco", "terrible", "calma", "cena", "gobierno",
  "comprar", "sargento", "destino", "existir", "novio", "sala", "través", "regalo", "iglesia", "cualquiera",
  "excelente", "deseo", "alma", "espada", "carne", "maravilloso", "peligroso", "dirección", "libertad", "sorpresa",
  "club", "luna", "salvar", "carta", "teniente", "ambos", "decisión", "enemigo", "dulce", "divertir",
  "puro", "asiento", "vuelo", "ante", "bienvenido", "contacto", "posición", "planeta", "coronel", "base",
  "suelo", "pelear", "pistola", "frío", "comandante", "sur", "rato", "mar", "espacio", "asesinato",
  "ventana", "prisa", "tienda", "cámara", "según", "broma", "reunión", "despertar", "sacar", "papel",
  "locura", "departamento", "horrible", "enfermo", "cárcel", "isla", "salida", "gato", "doler", "crimen",

  /* 601-700 */
  "causa", "bar", "ocho", "temprano", "río", "relación", "droga", "ojalá", "radio", "excepto",
  "brazo", "rojo", "conocido", "universidad", "investigación", "batalla", "regla", "cargo", "hogar", "respeto",
  "estación", "corte", "paciente", "encuentro", "energía", "baile", "abuela", "caliente", "rayo", "simple",
  "bailar", "triste", "zona", "guardia", "canción", "salud", "parar", "soldado", "caballo", "interesar",
  "volar", "principio", "nivel", "finalmente", "debajo", "bosque", "bolsa", "taxi", "ocupado", "amable",
  "acaso", "equivocado", "obra", "consejo", "público", "animal", "azul", "apostar", "prisión", "inteligente",
  "metro", "fantástico", "duda", "cerveza", "unido", "princesa", "quedar", "miles", "compañero", "espalda",
  "bomba", "apenas", "leer", "papi", "mantener", "rico", "tocar", "acción", "mando", "memoria",
  "vestido", "camión", "robot", "montón", "máquina", "trago", "mayoría", "reina", "lleno", "inglés",
  "estrella", "valor", "delante", "código", "héroe", "fe", "capaz", "beber", "velocidad", "partido",

  /* 701-800 */
  "opinión", "cocina", "abrir", "escribir", "golpe", "ganas", "ejemplo", "contar", "propósito", "anillo",
  "pedir", "estilo", "pista", "escapar", "espíritu", "molestar", "nota", "diferencia", "tratar", "precio",
  "servir", "doble", "agradable", "embargo", "emergencia", "cuello", "boda", "aprender", "té", "informe",
  "experiencia", "mentira", "director", "exacto", "defensa", "confiar", "color", "probar", "príncipe", "vacaciones",
  "fondo", "verde", "opción", "operación", "traer", "principal", "zapato", "respecto", "especie", "éxito",
  "pierna", "unidad", "hielo", "matrimonio", "piel", "arte", "común", "intentar", "levantar", "brillante",
  "calor", "visita", "presión", "pared", "esperanza", "completo", "subir", "cansado", "recordar", "trampa",
  "monstruo", "bajar", "grandioso", "socio", "herido", "caer", "cine", "escena", "tía", "mover",
  "tema", "preparado", "depender", "oeste", "viento", "estupendo", "caminar", "juicio", "carga", "banda",
  "tarjeta", "nueve", "seguramente", "majestad", "aeropuerto", "enorme", "área", "ridículo", "reloj", "flor",

  /* 801-900 */
  "mapa", "culpable", "pareja", "laboratorio", "beso", "nariz", "cuestión", "perdonar", "verano", "preferir",
  "peso", "oscuridad", "cliente", "televisión", "prensa", "vistazo", "inmediatamente", "solamente", "gordo", "posibilidad",
  "medicina", "pantalón", "definitivamente", "cinta", "desear", "riesgo", "cuento", "sentimiento", "objetivo", "arreglar",
  "casado", "bote", "proyecto", "nervioso", "lana", "pedazo", "absolutamente", "evitar", "bala", "vosotros",
  "confianza", "especialmente", "limpio", "comenzar", "ruido", "belleza", "líder", "preguntar", "inocente", "lástima",
  "red", "enfermedad", "diente", "central", "marcha", "justicia", "bello", "cabello", "oscuro", "embarazada",
  "costa", "dama", "orgulloso", "vos", "cura", "lengua", "araña", "voluntad", "total", "dedo",
  "agradecer", "partir", "lucha", "leche", "copa", "destruir", "acceso", "desastre", "herida", "débil",
  "naturaleza", "luchar", "imagen", "pan", "varios", "auxilio", "sentar", "responsable", "aquel", "sonido",
  "escrito", "carro", "precioso", "muestra", "restaurante", "huevo", "fantasma", "profesional", "entero", "cerrar",

  /* 901-1000 */
  "dueño", "cuchillo", "turno", "tormenta", "playa", "victoria", "primo", "interior", "piedra", "militar",
  "computadora", "silla", "movimiento", "familiar", "apartamento", "disparar", "tesoro", "motivo", "valiente", "víctima",
  "diario", "autobús", "descanso", "quieto", "tamaño", "colegio", "cabo", "video", "pelota", "directo",
  "sombrero", "estudio", "grave", "protección", "pecho", "costar", "lago", "obviamente", "robo", "apoyo",
  "imaginar", "amenaza", "viernes", "roto", "piloto", "marca", "combate", "sección", "profundo", "serie",
  "contrato", "americano", "paseo", "repente", "tropa", "uso", "distancia", "averiguar", "actuar", "pulso",
  "elección", "sujeto", "época", "pesar", "vender", "gratis", "desaparecer", "empleo", "comprender", "contento",
  "tumba", "huella", "absoluto", "durar", "descansar", "propiedad", "dormido", "castillo", "dato", "torre",
  "robar", "botella", "testigo", "presentar", "periódico", "juez", "esquina", "milla", "fuente", "techo",
  "genio", "alerta", "olvidar", "menor", "explicar", "privado", "miembro", "nacional", "discutir", "detalle",
];

/** Position in the list, 1-based. Words not listed keep no rank at all. */
export const FREQUENCY_RANK: Map<string, number> = new Map(
  FREQUENCY_ORDER.map((word, index) => [word, index + 1]),
);
