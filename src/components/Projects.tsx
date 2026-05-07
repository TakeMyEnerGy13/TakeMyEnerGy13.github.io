import { PROJECTS } from '../data';
import { T } from '../lens/T';

export function Projects() {
  return (
    <section
      id="work"
      className="relative px-[var(--spacing-25)] md:px-[var(--spacing-55)] pt-[var(--spacing-111)] pb-[var(--spacing-111)]"
    >
      <header className="flex items-end justify-between border-b border-[var(--color-medium-gray)] pb-[var(--spacing-25)] mb-[var(--spacing-55)]">
        <h2 className="text-[var(--text-heading-sm)] font-bold uppercase tracking-brand">
          <T en="Selected Work" ru="Избранные работы" />
        </h2>
        <span className="text-[var(--text-caption)] uppercase tracking-brand opacity-70">
          <T
            en={`${PROJECTS.length} projects · 2024–2025`}
            ru={`${PROJECTS.length} проекта · 2024–2025`}
          />
        </span>
      </header>

      <ul className="flex flex-col">
        {PROJECTS.map((p, i) => (
          <li key={p.id}>
            <a
              href={p.github}
              target="_blank"
              rel="noreferrer noopener"
              className="group block py-[var(--spacing-35)] border-t border-[var(--color-medium-gray)] no-underline transition-colors"
              style={{
                color: 'var(--color-ghost-white)',
              }}
            >
              <div className="grid grid-cols-12 gap-[var(--spacing-14)] items-baseline">
                <span className="col-span-2 md:col-span-1 text-[var(--text-caption)] uppercase tracking-brand opacity-50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="col-span-10 md:col-span-7">
                  <div className="text-[var(--text-caption)] uppercase tracking-brand opacity-60 mb-[var(--spacing-8)]">
                    <T block en={p.kind.en} ru={p.kind.ru} />
                  </div>
                  <h3
                    className="font-extrabold uppercase tracking-brand leading-[1.05]"
                    style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}
                  >
                    {p.title.en}
                  </h3>
                </div>
                <div className="col-span-12 md:col-span-3 md:col-start-9 text-[var(--text-body-sm)] uppercase tracking-brand opacity-80">
                  <T block en={p.summary.en} ru={p.summary.ru} />
                </div>
                <div className="col-span-12 md:col-span-1 md:col-start-12 text-[var(--text-caption)] uppercase tracking-brand opacity-60 text-right">
                  {p.year}
                </div>
                <div className="col-start-3 col-span-10 md:col-start-2 md:col-span-11 mt-[var(--spacing-25)] flex flex-wrap items-center gap-[var(--spacing-8)] text-[var(--text-caption)] uppercase tracking-brand">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="px-[var(--spacing-14)] py-[var(--spacing-5)] rounded-[var(--radius-link)] border border-[var(--color-medium-gray)] opacity-90"
                    >
                      {s}
                    </span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-[var(--spacing-8)] opacity-70 group-hover:opacity-100 transition-opacity">
                    <T en="Open repo" ru="Открыть репо" />
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
