import { PROFILE } from '../data';
import { T } from '../lens/T';

export function About() {
  return (
    <section
      id="about"
      className="relative px-[var(--spacing-25)] md:px-[var(--spacing-55)] py-[var(--spacing-111)] border-t border-[var(--color-medium-gray)]"
    >
      <div className="grid grid-cols-12 gap-[var(--spacing-25)]">
        <div className="col-span-12 md:col-span-4">
          <span className="text-[var(--text-caption)] uppercase tracking-brand opacity-70">
            <T base="ru" en="(About)" ru="(Обо мне)" />
          </span>
        </div>
        <div className="col-span-12 md:col-span-8">
          <h2
            className="font-extrabold uppercase tracking-brand leading-[1.05]"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
          >
            <T
              swap
              base="ru"
              en="Developer. AI enthusiast. Designer."
              ru="Разработчик. AI-энтузиаст. Дизайнер."
            />
          </h2>
          <p className="mt-[var(--spacing-35)] text-[var(--text-body-lg)] uppercase tracking-brand opacity-90 max-w-[60ch]">
            <T swap base="ru" en={PROFILE.blurb.en} ru={PROFILE.blurb.ru} />
          </p>

          <ul className="mt-[var(--spacing-55)] grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-25)] text-[var(--text-caption)] uppercase tracking-brand">
            <li className="border-t border-[var(--color-medium-gray)] pt-[var(--spacing-14)]">
              <div className="opacity-60 mb-[var(--spacing-8)]">Focus</div>
              <div className="font-bold">LLM · RAG · Agents</div>
            </li>
            <li className="border-t border-[var(--color-medium-gray)] pt-[var(--spacing-14)]">
              <div className="opacity-60 mb-[var(--spacing-8)]">Languages</div>
              <div className="font-bold">Python · TS · Rust</div>
            </li>
            <li className="border-t border-[var(--color-medium-gray)] pt-[var(--spacing-14)]">
              <div className="opacity-60 mb-[var(--spacing-8)]">Cloud</div>
              <div className="font-bold">AWS · GCP · Modal</div>
            </li>
            <li className="border-t border-[var(--color-medium-gray)] pt-[var(--spacing-14)]">
              <div className="opacity-60 mb-[var(--spacing-8)]">
                <T base="ru" en="Status" ru="Статус" />
              </div>
              <div className="font-bold">
                <T base="ru" en="Available" ru="Свободен" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
