import AddressCreateScreen from "@/features/addresses/ui/screens/AddressCreateScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nueva Dirección",
};

export default function NewAddressPage() {
  return <AddressCreateScreen />;
}
