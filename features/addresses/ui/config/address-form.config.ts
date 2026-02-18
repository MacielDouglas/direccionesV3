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
