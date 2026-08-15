export type DemoMuseumFlag = "personChanged" | "noVisits" | null;

export type DemoMuseum = {
  id: string;
  name: string;
  photo: string;
  street: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  flag: DemoMuseumFlag;
  inviteDelivered: boolean;
  inviteYear?: number;
};

export const DEMO_MUSEUMS: DemoMuseum[] = [
  {
    id: "masp",
    name: "MASP — Museu de Arte de São Paulo",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Vista_a%C3%A9rea_de_la_Avenida_Paulista_de_S%C3%A3o_Paulo_05.jpg/1920px-Vista_a%C3%A9rea_de_la_Avenida_Paulista_de_S%C3%A3o_Paulo_05.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    street: "Av. Paulista, 1578",
    neighborhood: "Bela Vista",
    city: "São Paulo, SP",
    lat: -23.561611,
    lng: -46.655917,
    flag: "personChanged",
    inviteDelivered: false,
  },
  {
    id: "amanha",
    name: "Museu do Amanhã",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Museu_do_Amanh%C3%A3_rio.jpg/1920px-Museu_do_Amanh%C3%A3_rio.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    street: "Praça Mauá, 1",
    neighborhood: "Centro",
    city: "Rio de Janeiro, RJ",
    lat: -22.89507,
    lng: -43.17974,
    flag: "noVisits",
    inviteDelivered: false,
  },
  {
    id: "pinacoteca",
    name: "Pinacoteca de São Paulo",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Pinacoteca_de_S%C3%A3o_Paulo%2C_Brazil.jpg/1920px-Pinacoteca_de_S%C3%A3o_Paulo%2C_Brazil.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    street: "Praça da Luz, 2",
    neighborhood: "Luz",
    city: "São Paulo, SP",
    lat: -23.53444,
    lng: -46.63389,
    flag: null,
    inviteDelivered: true,
    inviteYear: 2026,
  },
  {
    id: "inhotim",
    name: "Instituto Inhotim",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/a/a3/Inhotim_-_panoramio_%28cropped%29.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=original",
    street: "Rua B, 20",
    neighborhood: "Inhotim",
    city: "Brumadinho, MG",
    lat: -20.12389,
    lng: -44.21889,
    flag: null,
    inviteDelivered: false,
  },
  {
    id: "mon",
    name: "Museu Oscar Niemeyer",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/c/c3/Museu_do_Olho_-_Oscar_Niemeyer_-_Curitiba_Brasil_%2810146136615%29.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=original",
    street: "Rua Marechal Hermes, 999",
    neighborhood: "Centro Cívico",
    city: "Curitiba, PR",
    lat: -25.40972,
    lng: -49.26722,
    flag: null,
    inviteDelivered: false,
  },
  {
    id: "imperial",
    name: "Museu Imperial",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/2/24/Museu_Imperial_03_%28cropped%29.JPG?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=original",
    street: "Rua da Imperatriz, 220",
    neighborhood: "Centro",
    city: "Petrópolis, RJ",
    lat: -22.50778,
    lng: -43.17917,
    flag: null,
    inviteDelivered: false,
  },
];

export const DEMO_CARD = {
  number: "001",
  // impeccable-disable-next-line design-system-color -- cor fictícia do cartão (no app real vem do banco)
  color: "#1d4ed8",
  holder: "Ana Maria",
  museumIds: ["masp", "amanha"],
} as const;

export function demoMuseumById(id: string): DemoMuseum | undefined {
  return DEMO_MUSEUMS.find((museum) => museum.id === id);
}
