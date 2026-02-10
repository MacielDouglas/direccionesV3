import { Bed, Home, Hotel, Store, Utensils } from "lucide-react";

export const ADDRESS_TYPE_OPTIONS = [
  { value: "House", label: "Casa", icon: Home },
  { value: "Apartment", label: "Apartamento", icon: Hotel },
  { value: "Store", label: "Negócio", icon: Store },
  { value: "Hotel", label: "Hotel", icon: Bed },
  { value: "Restaurant", label: "Restaurante", icon: Utensils },
];

export const ADDRESS_FORMS_OPTIONS = [
  {
    kind: "text",
    name: "businessName",
    label: "Nombre del establecimiento",
    placeholder: "Ej. Hotel Playa",
  },
  {
    kind: "text",
    name: "street",
    label: "Calle",
    placeholder: "Ej. Rua Enseada dos Corais",
  },
  {
    kind: "group",
    fields: [
      {
        kind: "text",
        name: "number",
        label: "Numero",
        placeholder: "Ej. 123 u 123A u s/n",
      },
      {
        kind: "text",
        name: "neighborhood",
        label: "Barrio",
        placeholder: "Ej. Porto de Galinhas",
      },
    ],
  },
  {
    kind: "text",
    name: "city",
    label: "Ciudad",
    placeholder: "Ej. Ipojuca",
  },

  {
    kind: "text",
    name: "info",
    label: "Información adicional",
    placeholder:
      "Ej. Apartamento 10, dos casas más allá de la farmacia MedCar, frente al número 234.",
  },
  {
    kind: "group",
    fields: [
      {
        kind: "switch",
        name: "active",
        label: "Dirección activa?",
        placeholder: "Dirección activa",
      },

      {
        kind: "switch",
        name: "confirmed",
        label: "Dirección confirmada?",
        placeholder: "Dirección confirmada.",
      },
    ],
  },
];

export const DEFAULT_ADDRESS_IMAGES = [
  {
    type: "House",
    url: "https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev/security/33eabcb2-6cbf-4cc1-a924-63f214551616.webp",
  },
  {
    type: "Apartment",
    url: "https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev/security/e813bfc7-71ac-4a99-8929-e77a6e089cf1.webp",
  },
  {
    type: "Store",
    url: "https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev/security/3b677f70-46b7-4c1a-b340-80f53a3c7b97.webp",
  },
  {
    type: "Hotel",
    url: "https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev/security/5e4bc7d2-1916-45a0-8446-96e663185956.webp",
  },
  {
    type: "Restaurant",
    url: "https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev/security/9b0ed121-a929-4e88-b182-b041dbf4cb3f.webp",
  },
  {
    type: "Clinic",
    url: "https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev/security/8d707ab9-1175-4193-ac3f-55da11e9f0ea.webp",
  },
] as const;
