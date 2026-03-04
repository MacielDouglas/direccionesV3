import type { NavigationItem as Item } from "@/features/navigation/constants/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  item: Item;
  orgSlug: string;
  onSelect: () => void;
  className?: string;
};

export default function MenuItem({
  item,
  onSelect,
  orgSlug,
  className,
}: Props) {
  const Icon = item.icon;

  return (
    <Link
      href={`/org/${orgSlug}${item.href}`}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
    >
      <Icon className="h-7 w-7" aria-hidden="true" />
      <span className="font-medium">{item.name}</span>
    </Link>
  );
}
