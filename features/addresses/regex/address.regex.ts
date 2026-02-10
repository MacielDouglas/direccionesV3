export const GENDER_REGEX =
  /\b(homem|homens|hombre|hombres|mulher|mulheres|mujer|mujeres)\b/gi;

const NATIONALITIES = [
  // Argentina
  "argentino",
  "argentina",
  "argentinos",
  "argentinas",

  // Bolívia
  "boliviano",
  "boliviana",
  "bolivianos",
  "bolivianas",

  // Chile
  "chileno",
  "chilena",
  "chilenos",
  "chilenas",

  // Colômbia
  "colombiano",
  "colombiana",
  "colombianos",
  "colombianas",

  // Costa Rica
  "costarriquenho",
  "costarriquenha",
  "costarricense",
  "costarricenses",

  // Cuba
  "cubano",
  "cubana",
  "cubanos",
  "cubanas",

  // Equador
  "equatoriano",
  "equatoriana",
  "equatorianos",
  "equatorianas",

  // El Salvador
  "salvadorenho",
  "salvadorenha",
  "salvadoreño",
  "salvadoreña",
  "salvadoreños",
  "salvadoreñas",

  // Espanha
  "espanhol",
  "espanhola",
  "espanhóis",
  "espanholas",
  "español",
  "española",
  "españoles",
  "españolas",

  // Guatemala
  "guatemalteco",
  "guatemalteca",
  "guatemaltecos",
  "guatemaltecas",

  // Honduras
  "hondurenho",
  "hondurenha",
  "hondureño",
  "hondureña",
  "hondureños",
  "hondureñas",

  // México
  "mexicano",
  "mexicana",
  "mexicanos",
  "mexicanas",

  // Nicarágua
  "nicaraguense",
  "nicaragüense",
  "nicaragüenses",

  // Panamá
  "panamenho",
  "panamenha",
  "panameño",
  "panameña",
  "panameños",
  "panameñas",

  // Paraguai
  "paraguaio",
  "paraguaia",
  "paraguaios",
  "paraguaias",

  // Peru
  "peruano",
  "peruana",
  "peruanos",
  "peruanas",

  // Porto Rico
  "porto-riquenho",
  "porto-riquenha",
  "puertorriqueño",
  "puertorriqueña",
  "puertorriqueños",
  "puertorriqueñas",

  // República Dominicana
  "dominicano",
  "dominicana",
  "dominicanos",
  "dominicanas",

  // Uruguai
  "uruguaio",
  "uruguaia",
  "uruguaios",
  "uruguaias",

  // Venezuela
  "venezuelano",
  "venezuelana",
  "venezuelanos",
  "venezuelanas",
];

export const NATIONALITY_REGEX = new RegExp(
  `\\b(${NATIONALITIES.join("|")})\\b`,
  "gi",
);
