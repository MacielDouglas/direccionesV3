"use client";

import { ChevronUp } from "lucide-react";

export default function BackToTopButton() {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleBackToTop}
      aria-label="Volver al inicio de la página"
      className="absolute right-4 top-4 rounded-full bg-brand p-2 text-brand-foreground shadow-sm transition-colors hover:bg-brand/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:right-6 sm:top-6 lg:right-8 lg:top-8"
    >
      <ChevronUp className="size-5" aria-hidden="true" />
    </button>
  );
}
