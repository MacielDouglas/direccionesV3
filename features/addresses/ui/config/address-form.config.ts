import type { I18nDictionary } from "@/lib/i18n/types";

type AddressKey = keyof I18nDictionary["addresses"];

type AddressFormField =
  | {
      kind: "text";
      name: string;
      labelKey: AddressKey;
      placeholderKey?: AddressKey;
    }
  | {
      kind: "switch";
      name: string;
      labelKey: AddressKey;
    };

type AddressFormOption =
  | {
      kind: "text";
      name: string;
      labelKey: AddressKey;
      placeholderKey?: AddressKey;
    }
  | {
      kind: "group";
      id: string;
      fields: AddressFormField[];
    };

export const ADDRESS_FORMS_OPTIONS: AddressFormOption[] = [
  {
    kind: "text",
    name: "businessName",
    labelKey: "formBusinessLabel",
    placeholderKey: "formBusinessPlaceholder",
  },
  {
    kind: "text",
    name: "street",
    labelKey: "formStreetLabel",
    placeholderKey: "formStreetPlaceholder",
  },
  {
    kind: "group",
    id: "group-number-neighborhood",
    fields: [
      {
        kind: "text",
        name: "number",
        labelKey: "formNumberLabel",
        placeholderKey: "formNumberPlaceholder",
      },
      {
        kind: "text",
        name: "neighborhood",
        labelKey: "formNeighborhoodLabel",
        placeholderKey: "formNeighborhoodPlaceholder",
      },
    ],
  },
  {
    kind: "text",
    name: "city",
    labelKey: "formCityLabel",
    placeholderKey: "formCityPlaceholder",
  },
  {
    kind: "text",
    name: "info",
    labelKey: "formInfoLabel",
    placeholderKey: "formInfoPlaceholder",
  },
  {
    kind: "group",
    id: "group-active-confirmed",
    fields: [
      {
        kind: "switch",
        name: "active",
        labelKey: "formActiveLabel",
      },
      {
        kind: "switch",
        name: "confirmed",
        labelKey: "formConfirmedLabel",
      },
    ],
  },
];
