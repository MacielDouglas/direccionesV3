import type { Metadata } from "next";
import AddressCreateScreen from "@/features/addresses/ui/screens/AddressCreateScreen";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.addresses.createTitle };
}

export default function NewAddressPage() {
  return <AddressCreateScreen />;
}
