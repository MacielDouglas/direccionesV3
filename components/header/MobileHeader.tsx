"use client";
import { getNavigationByRole, navigationMenu } from "@/constants/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import MobileMenuItem from "./MobileMenuItem";
import LogoutButton from "../LogoutButton";

interface MenuMobileProps {
  role?: "member" | "admin" | "owner" | null;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function MobileHeader({
  role,
  className,
  onClick,
  isOpen: controlledIsOpen,
  onToggle,
}: MenuMobileProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];

  const handleClick = () => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(!isOpen);
    }
    onToggle?.(!isOpen);
    onClick?.();
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative h-12 w-12 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800",
              className,
            )}
            onClick={handleClick}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            <MenuIcon className="w-20 h-20 text-white" width={20} height={20} />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full  sm:w-96 ">
          <SheetHeader className="bg-[#0c232a] p-10">
            <SheetTitle className="text-white">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 p-10">
            {navigation.length > 0 ? (
              navigation.map((item) => (
                <MobileMenuItem key={item.id} item={item} />
              ))
            ) : (
              <LogoutButton />
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
