// Palavras sensíveis: nacionalidades, gentílicos e termos de gênero
// de países hispanofalantes + Brasil — PT e ES, todas as variações
const SENSITIVE_WORDS: string[] = [
  // Gênero
  "hombre",
  "hombres",
  "mujer",
  "mujeres",
  "homem",
  "homens",
  "mulher",
  "mulheres",
  "señor",
  "señora",
  "señorita",
  "senhor",
  "senhora",
  "senhorita",
  "chico",
  "chica",
  "chicos",
  "chicas",
  "rapaz",
  "moça",

  // Argentina
  "argentino",
  "argentina",
  "argentinos",
  "argentinas",

  // México
  "mexico",
  "mexicano",
  "mexicana",
  "mexicanos",
  "mexicanas",
  "mejicano",
  "mejicana",
  "mejicanos",
  "mejicanas",

  // Colombia
  "colombia",
  "colombiano",
  "colombiana",
  "colombianos",
  "colombianas",

  // Chile
  "chile",
  "chileno",
  "chilena",
  "chilenos",
  "chilenas",

  // Peru
  "peru",
  "peruano",
  "peruana",
  "peruanos",
  "peruanas",

  // Venezuela
  "venezuela",
  "venezolano",
  "venezolana",
  "venezolanos",
  "venezolanas",
  "venezuelano",
  "venezuelana",
  "venezuelanos",
  "venezuelanas",

  // Equador
  "equador",
  "equator",
  "ecuatoriano",
  "ecuatoriana",
  "ecuatorianos",
  "ecuatorianas",
  "equatoriano",
  "equatoriana",
  "equatorianos",
  "equatorianas",

  // Bolívia
  "bolivia",
  "boliviano",
  "boliviana",
  "bolivianos",
  "bolivianas",

  // Paraguai
  "paraguai",
  "paraguay",
  "paraguayo",
  "paraguaya",
  "paraguayos",
  "paraguayas",
  "paraguaio",
  "paraguaia",
  "paraguaios",
  "paraguaias",

  // Uruguai
  "uruguai",
  "uruguay",
  "uruguayo",
  "uruguaya",
  "uruguayos",
  "uruguayas",
  "uruguaio",
  "uruguaia",
  "uruguaios",
  "uruguaias",
  "uruguay",

  // Cuba
  "cuba",
  "cubano",
  "cubana",
  "cubanos",
  "cubanas",

  // República Dominicana
  "dominicano",
  "dominicana",
  "dominicanos",
  "dominicanas",

  // Guatemala
  "guatemala",
  "guatemalteco",
  "guatemalteca",
  "guatemaltecos",
  "guatemaltecas",

  // Honduras
  "honduras",
  "hondureño",
  "hondureña",
  "hondureños",
  "hondureñas",
  "hondurenho",
  "hondurenha",

  // El Salvador
  "el salvador",
  "salvadoreño",
  "salvadoreña",
  "salvadoreños",
  "salvadoreñas",
  "salvadorenho",
  "salvadorenha",

  // Nicaragua
  "nicaragua",
  "nicaragüense",
  "nicaraguense",
  "nicaragüenses",
  "nicaraguenses",

  // Costa Rica
  "costa rica",
  "costarricense",
  "costarricenses",
  "costariquenho",
  "costariquenha",

  // Panamá
  "panama",
  "panameño",
  "panameña",
  "panameños",
  "panameñas",
  "panamenho",
  "panamenha",

  // Porto Rico
  "puerto rico",
  "puertorriqueño",
  "puertorriqueña",
  "puertorriqueños",
  "puertorriqueñas",
  "portorriquenho",
  "portorriquenha",

  // Espanha
  "español",
  "española",
  "españoles",
  "españolas",
  "espanhol",
  "espanhola",
  "espanhóis",
  "espanholas",

  // Brasil (PT)
  "brasil",
  "brazil",
  "brasileiro",
  "brasileira",
  "brasileiros",
  "brasileiras",
  "brasileño",
  "brasileña",
];

// Ordena por comprimento decrescente para evitar substituições parciais
const SORTED_WORDS = [...SENSITIVE_WORDS].sort((a, b) => b.length - a.length);

// Gera regex com todas as palavras como alternativas, palavra completa (\b)
const SENSITIVE_REGEX = new RegExp(
  `\\b(${SORTED_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);

/**
 * Substitui palavras sensíveis por asteriscos mantendo o comprimento original.
 * Ex: "Hombre" → "******", "uruguayo" → "********"
 */
export function sanitizeInfo(text: string | null | undefined): string | null {
  if (!text) return text ?? null;
  return text.replace(SENSITIVE_REGEX, (match) => "*".repeat(match.length));
}
