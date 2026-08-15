import { DemoApp } from "@/features/demo/ui/DemoApp";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.demo.badge };
}

export default function DemoPage() {
  return <DemoApp />;
}
