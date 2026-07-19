import { PROFILE } from '../data';
import { T } from '../lens/T';
import { NebulaCanvas } from './NebulaCanvas';

const links: Array<{
  label: { en: string; ru: string };
  handle: string;
  href: string;
}> = [
  {
    label: { en: 'GitHub', ru: 'GitHub' },
    handle: '@TakeMyEnerGy13',
    href: PROFILE.github,
  },
  {
    label: { en: 'Email', ru: 'Почта' },
    handle: PROFILE.email,
    href: `mailto:${PROFILE.email}`,
  },
  {
    label: { en: 'Telegram', ru: 'Telegram' },
    handle: '@TakeMyEnerGy13',
    href: PROFILE.telegram,
  },
];

export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-[var(--color-medium-gray)]"
    >
      {/* Animated WebGL Nebula — same shader as the hero, dimmed */}
      <div className="absolute inset-0 pointer-events-none">
        <NebulaCanvas opacity={0.85} />
      </div>
      {/* Edge vignette to keep typography crisp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      <div className="relative px-[var(--spacing-25)] md:px-[var(--spacing-55)] py-[var(--spacing-111)]">
        <span className="text-[var(--text-caption)] uppercase tracking-brand opacity-70">
          (Contact)
        </span>

        <h2
          className="mt-[var(--spacing-25)] font-extrabold uppercase leading-[0.95]"
          style={{ fontSize: 'clamp(48px, 10vw, 140px)', letterSpacing: '0.03em' }}
        >
          <span className="block"><T block en="LET'S" ru="ДАВАЙТЕ" /></span>
          <span className="block"><T block en="BUILD" ru="СТРОИТЬ" /></span>
          <span className="block"><T block en="TOGETHER." ru="ВМЕСТЕ." /></span>
        </h2>

        <ul className="mt-[var(--spacing-55)] flex flex-col">
          {links.map((l) => (
            <li
              key={l.href}
              className="border-t border-[var(--color-medium-gray)] last:border-b"
            >
              <a
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer noopener"
                className="group grid grid-cols-12 gap-[var(--spacing-14)] items-center py-[var(--spacing-25)] no-underline transition-opacity"
                style={{ color: 'var(--color-ghost-white)' }}
              >
                <span className="col-span-3 md:col-span-2 text-[var(--text-caption)] uppercase tracking-brand opacity-60">
                  {l.label.en}
                </span>
                <span
                  className="col-span-7 md:col-span-8 font-extrabold uppercase tracking-brand"
                  style={{ fontSize: 'clamp(22px, 3vw, 33px)' }}
                >
                  {l.handle}
                </span>
                <span className="col-span-2 text-right text-[var(--text-body)] opacity-70 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-[var(--spacing-55)] flex flex-wrap items-end justify-between gap-[var(--spacing-25)] text-[var(--text-caption)] uppercase tracking-brand opacity-70">
          <span>Built with React · Tailwind · A glass loupe</span>
          <span>© 2026 — TakeMyEnerGy</span>
        </div>
      </div>
    </section>
  );
}
