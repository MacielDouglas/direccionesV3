import { NavigationItem as Item } from "@/constants/navigation";
import Link from "next/link";

type Props = {
  item: Item;
  onSelect: () => void;
};

export default function MobileMenuItem({ item, onSelect }: Props) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className="flex items-center gap-5 text-2xl border-b p-5 "
    >
      <Icon className="h-8 w-8" />
      <span>{item.name}</span>
    </Link>
  );
}
