import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { Cannon, CannonPattern } from "@/components/club-emblem";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Задачи · The Gunners",
  description: "Работни и лични задачи в червено и бяло.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bg"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="relative isolate flex min-h-full flex-col overflow-x-hidden">
        {/* Red-and-white background: red top with a slanted edge, white below with faint cannons */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <CannonPattern className="absolute inset-0 size-full text-club-gold/20 dark:text-club-gold/15" />
          <div className="absolute inset-x-0 top-0 h-120 bg-club-red [clip-path:polygon(0_0,100%_0,100%_78%,0_100%)] sm:h-108">
            <div className="absolute inset-0 bg-linear-to-b from-club-red to-club-red-dark" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgb(255_255_255/0.06)_0_22px,transparent_22px_44px)]" />
            <Cannon className="absolute -top-16 -right-20 w-md text-club-gold sm:right-[3%]" />
            <Cannon className="absolute top-16 -left-24 w-80 -scale-x-100 text-club-gold sm:left-[1%]" />
          </div>
        </div>

        {children}

        <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 pt-4 pb-8 font-display text-sm tracking-[0.2em] text-club-red uppercase dark:text-red-400">
          <span>North London is Red</span>
          <span aria-hidden className="text-club-gold">★</span>
          <span>COYG</span>
          <span aria-hidden className="text-club-gold">★</span>
          <span>Est. 1886</span>
        </footer>
      </body>
    </html>
  );
}
