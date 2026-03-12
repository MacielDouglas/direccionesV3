import type { Metadata, Viewport } from "next";
import { Outfit, Inconsolata } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "next-themes";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inconsolata",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Direcciones",
    template: "%s | Direcciones",
  },
  description: "Gestión de direcciones y ubicaciones.",

  // PWA / mobile
  applicationName: "Direcciones",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // respeita safe area no iOS
    title: "Direcciones",
  },
  formatDetection: {
    telephone: false, // evita que iOS converta números em links de chamada
  },

  // Segurança — não indexar
  robots: {
    index: false,
    follow: false,
  },

  // Ícones
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // 180x180 recomendado
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // maximumScale: 1, // evita zoom involuntário em inputs no iOS
  // userScalable: false, // junto com maximumScale — padrão para app-like
  viewportFit: "cover", // safe area para notch/dynamic island
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2f4" },
    { media: "(prefers-color-scheme: dark)", color: "#101010" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Previne flash de conteúdo não estilizado no iOS PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`
          ${outfit.variable} ${inconsolata.variable}
          font-sans antialiased
          overflow-x-hidden
          bg-background text-foreground
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to content — acessibilidade para teclado/screen reader */}
          <a
            href="#main-content"
            className="
              sr-only focus:not-sr-only
              fixed top-2 left-2 
              rounded-md bg-background px-4 py-2
              text-sm font-medium text-foreground
              shadow-md ring-2 ring-ring
              focus:outline-none
            "
          >
            Ir al contenido principal
          </a>

          <NextTopLoader color="#ff6828" showSpinner={false} height={2} />
          <Toaster position="top-center" richColors closeButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
