"use client";

import { getNavigationByRole, navigationMenu } from "@/constants/navigation";
import LogoutButton from "../LogoutButton";
import MenuItem from "./MenuItem";

interface MainAppMenuProps {
  role?: "member" | "admin" | "owner" | null;
  orgSlug: string;
}

export default function MainAppMenu({ role, orgSlug }: MainAppMenuProps) {
  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];

  const menu = navigation.filter((item) => item.id !== "home");

  const handleHaptic = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const baseItemStyle = `
    group flex items-center gap-5
    rounded-xl p-4 pl-8
    shadow-md shadow-black/10 dark:shadow-black/30
    transition-all duration-150 ease-out
    active:scale-95 active:shadow-sm
    select-none justify-between
  `;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-black/10 pb-8 dark:border-white/10">
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-3">
            {menu.map((item) => {
              const Icon = item.icon;

              const bgStyle = item.roles
                ? "bg-orange-500 text-white"
                : "bg-[#ccc] dark:bg-second-drk";

              if (item.children) {
                return (
                  <details key={item.id} className="group">
                    <summary
                      className={`${baseItemStyle} ${bgStyle} cursor-pointer list-none`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-7 w-7" />
                        <span className="text-lg font-medium">{item.name}</span>
                      </span>

                      <svg
                        className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>

                    <div className="m-2  rounded-xl bg-stone-300 dark:bg-stone-700/80 p-2 space-y-4">
                      {item.children.map((cld) => (
                        <MenuItem
                          key={cld.id}
                          item={cld}
                          onSelect={handleHaptic}
                          orgSlug={orgSlug}
                          className={`${baseItemStyle}
                           bg-stone-400 dark:bg-tertiary-drk dark:text-tertiary-lgt
                            hover:scale-[1.01]
                          `}
                        />
                      ))}
                    </div>
                  </details>
                );
              }

              return (
                <MenuItem
                  key={item.id}
                  item={item}
                  onSelect={handleHaptic}
                  orgSlug={orgSlug}
                  className={`${baseItemStyle} ${bgStyle}`}
                />
              );
            })}
          </div>
        </nav>
      </div>

      <div className="pt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
