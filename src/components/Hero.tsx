import { PROFILE } from '../data';
import { T } from '../lens/T';
import { NebulaCanvas } from './NebulaCanvas';

/**
 * Full-bleed hero with the animated WebGL Nebula. Replaces the previous
 * static CSS gradient with a domain-warped fBm noise shader so the
 * background is constantly morphing — closer to the monopo.london reference.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen w-full overflow-hidden flex items-center"
    >
      {/* Animated WebGL Nebula */}
      <div className="absolute inset-0">
        <NebulaCanvas />
      </div>
      {/* Edge vignette to keep typography crisp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      <div className="relative w-full px-[var(--spacing-25)] md:px-[var(--spacing-55)] pt-[120px] pb-[var(--spacing-111)]">
        <div className="flex items-baseline gap-[var(--spacing-14)] uppercase text-[var(--text-caption)] tracking-brand opacity-90 mb-[var(--spacing-35)]">
          <span className="inline-block w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          <T en="AI Engineer · Open to collab" ru="AI-инженер · Открыт к работе" />
        </div>

        <h1
          className="text-display font-extrabold uppercase leading-[0.95]"
          style={{
            letterSpacing: '0.03em',
            textWrap: 'balance' as never,
            textShadow: '0 2px 30px rgba(0,0,0,0.35)',
          }}
        >
          <span className="block">
            <T block en="MAKE" ru="ПУСТЬ" />
          </span>
          <span className="block">
            <T block en="MACHINES" ru="МАШИНЫ" />
          </span>
          <span className="block">
            <T block en="THINK." ru="МЫСЛЯТ." />
          </span>
        </h1>

        <div className="mt-[var(--spacing-55)] grid grid-cols-12 gap-[var(--spacing-25)]">
          <p className="col-span-12 md:col-span-7 text-[var(--text-body-lg)] uppercase tracking-brand max-w-[60ch] opacity-95">
            <T block en={PROFILE.hero.en} ru={PROFILE.hero.ru} />
          </p>
          <div className="col-span-12 md:col-span-4 md:col-start-9 flex flex-col items-start md:items-end gap-[var(--spacing-14)] uppercase text-[var(--text-caption)] tracking-brand">
            <span className="opacity-70">
              <T en="Available · 2026" ru="Свободен · 2026" />
            </span>
            <span className="opacity-70">
              <T en={PROFILE.location.en} ru={PROFILE.location.ru} />
            </span>
            <a
              href="#work"
              className="mt-[var(--spacing-14)] inline-flex items-center gap-[var(--spacing-8)] px-[var(--spacing-25)] py-[var(--spacing-14)] rounded-[var(--radius-link)] border border-white text-white hover:bg-white hover:text-black transition-colors no-underline"
            >
              See selected work
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-[var(--spacing-25)] left-0 right-0 px-[var(--spacing-25)] md:px-[var(--spacing-55)] flex items-center justify-between text-[var(--text-caption)] uppercase tracking-brand opacity-80">
        <span>
          <T en="(scroll)" ru="(прокрутить)" />
        </span>
        <span>
          <T en="© 2026 — All rights reserved" ru="© 2026 — Все права защищены" />
        </span>
      </div>
    </section>
  );
}
