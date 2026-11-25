import type { Metadata } from "next";
import Link from "next/link";
import { ClubCrest } from "@/components/club-emblem";
import { isInviteOnly } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Поверителност · Задачи",
  description: "Какви данни пази приложението Задачи и как се използват.",
};

export default function PrivacyPage() {
  // Kept out of the public repo; set CONTACT_EMAIL in the hosting environment.
  const contactEmail = process.env.CONTACT_EMAIL?.trim();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <article className="w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl shadow-black/25 dark:border-zinc-800 dark:bg-zinc-950">
        <header className="flex items-center gap-4 bg-linear-to-br from-club-red to-club-red-dark px-6 py-6 text-white">
          <ClubCrest className="h-16 w-auto shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-wide uppercase">Поверителност</h1>
            <p className="text-sm text-white/80">Какви данни пази приложението „Задачи“</p>
          </div>
        </header>

        <div className="space-y-6 px-6 py-7 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          <Section title="Кой може да използва приложението">
            {isInviteOnly()
              ? "„Задачи“ е лично приложение за малък кръг поканени хора. Влиза се само с Google акаунт, чийто имейл собственикът на приложението е добавил в списъка с разрешени."
              : "„Задачи“ е лично приложение. Всеки, който има връзката, може да влезе с Google акаунт; всеки потребител вижда и променя само своите задачи."}
          </Section>

          <Section title="Какви данни се пазят">
            <ul className="list-disc space-y-1 pl-5">
              <li>От Google: твоето име, имейл адрес и вътрешният идентификатор на акаунта ти.</li>
              <li>Задачите, които въвеждаш: текст, дали са завършени, в кой лист са и кога са създадени.</li>
              <li>Бисквитка за сесията, за да останеш влязъл до 30 дни. Не се използват рекламни или проследяващи бисквитки.</li>
            </ul>
            Приложението не получава паролата ти за Google и няма достъп до пощата, файловете или други данни в Google акаунта ти.
          </Section>

          <Section title="Как се използват">
            Данните се използват само за да ти покажат твоите задачи на всяко устройство. Не се продават, не се споделят
            с трети страни и не се използват за реклама.
          </Section>

          <Section title="Къде се съхраняват и кой има достъп">
            Данните се пазят в база данни при Neon (Postgres) в Европейския съюз (Франкфурт), а приложението работи
            във Vercel. В приложението всеки вижда само своите задачи. Собственикът на приложението, като
            администратор на базата данни, технически има достъп до всички записи в нея.
          </Section>

          <Section title="Изтриване">
            Можеш да изтриеш задачите си по всяко време от самото приложение. Ако искаш да бъде изтрит и акаунтът ти
            заедно с всички данни, или имаш въпрос за данните си,{" "}
            {contactEmail ? (
              <>
                пиши на{" "}
                <a href={`mailto:${contactEmail}`} className="font-medium text-club-red hover:underline dark:text-red-400">
                  {contactEmail}
                </a>
                .
              </>
            ) : (
              "пиши на собственика на приложението."
            )}
          </Section>

          <p className="pt-2">
            <Link href="/" className="font-medium text-club-red hover:underline dark:text-red-400">
              ← Към задачите
            </Link>
          </p>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl font-semibold tracking-wide text-zinc-900 uppercase dark:text-zinc-100">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
