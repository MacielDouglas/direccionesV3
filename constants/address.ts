import { Bed, Home, Hotel, Store, Utensils } from "lucide-react";

export type AddressTypeItem = {
  id: string;
  name: string;
  icon: React.ElementType;
};

export const addressTypes: AddressTypeItem[] = [
  {
    id: "home",
    name: "Casa",
    icon: Home,
  },
  {
    id: "apartment",
    name: "Apartamento",
    icon: Hotel,
  },
  {
    id: "business",
    name: "Negocio",
    icon: Store,
  },
  {
    id: "restaurant",
    name: "Restaurante",
    icon: Utensils,
  },
  {
    id: "hotel",
    name: "Hotel",
    icon: Bed,
  },
];
