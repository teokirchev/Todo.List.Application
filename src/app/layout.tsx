import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { Cannon, CannonPattern } from "@/components/club-emblem";
import { TeamText } from "@/components/team-text";
import { ThemeToggle } from "@/components/theme-toggle";
import { TEAM_INIT_SCRIPT, teamCss } from "@/lib/teams";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
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
  title: "Задачи",
  description: "Работни и лични задачи в цветовете на любимия ти отбор.",
  appleWebApp: {
    capable: true,
    title: "Задачи",
    statusBarStyle: "black-translucent",
  },
};

// Colours the browser bar / phone status bar in club red.
export const viewport: Viewport = {
  themeColor: "#ef0107",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline script below sets data-theme before React hydrates.
    <html
      lang="bg"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <head>
        {/* Colours, crest, symbol and texts of every team; the active one follows <html data-team>. */}
        <style dangerouslySetInnerHTML={{ __html: teamCss() }} />
        {/* Applies the saved light/dark choice and team before the first paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT + ";" + TEAM_INIT_SCRIPT }} />
      </head>
      <body className="relative isolate flex min-h-full flex-col overflow-x-hidden">
        <ThemeToggle className="absolute top-4 left-4 z-20 sm:top-6 sm:left-6" />
        {/* Team-coloured top with a slanted edge, white below with the team symbol faintly tiled */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <CannonPattern className="absolute inset-0 size-full text-club-accent/20 dark:text-club-accent/15" />
          <div className="absolute inset-x-0 top-0 h-120 bg-club-primary [clip-path:polygon(0_0,100%_0,100%_78%,0_100%)] sm:h-108">
            <div className="absolute inset-0 bg-linear-to-b from-club-primary to-club-primary-dark" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgb(255_255_255/0.06)_0_22px,transparent_22px_44px)]" />
            {/* Two symbols on the band, in one of two sizes picked per team (sideSymbols in src/lib/teams.ts). */}
            {/* "big": wide, low symbols such as Arsenal's cannon. */}
            <Cannon className="team-side-big absolute -top-16 -right-20 w-md text-club-accent sm:right-[3%]" />
            <Cannon className="team-side-big team-symbol-mirror absolute top-16 -left-24 w-80 -scale-x-100 text-club-accent sm:left-[1%]" />
            {/* "compact": tall symbols (e.g. Liverpool's bird) stay inside the band and clear of the user menu. */}
            <Cannon className="team-side-compact absolute top-16 -right-6 w-40 text-club-accent sm:right-[6%] sm:w-64" />
            <Cannon className="team-side-compact team-symbol-mirror absolute top-24 -left-8 w-32 -scale-x-100 text-club-accent sm:top-28 sm:left-[4%] sm:w-60" />
          </div>
        </div>

        {children}

        <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 pt-4 pb-8 font-display text-sm tracking-[0.2em] text-club-primary uppercase dark:text-club-accent">
          <span>
            <TeamText field="footer" />
          </span>
          <span aria-hidden className="text-club-accent">★</span>
          <span>
            <TeamText field="chant" />
          </span>
          <span aria-hidden className="text-club-accent">★</span>
          <span>
            Est. <TeamText field="founded" />
          </span>
        </footer>
      </body>
    </html>
  );
}
