export function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-[var(--spacing-25)] md:px-[var(--spacing-55)] py-[var(--spacing-25)] flex items-center justify-between text-[var(--text-body)] uppercase tracking-brand"
      style={{
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)',
        backdropFilter: 'blur(6px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(6px) saturate(1.1)',
      }}
    >
      <a
        href="#top"
        className="font-extrabold no-underline"
        style={{ color: 'var(--color-ghost-white)' }}
      >
        TakeMyEnerGy
      </a>
      <ul className="hidden md:flex items-center gap-[var(--spacing-35)]">
        <li>
          <a href="#work" className="no-underline opacity-90 hover:opacity-100">Work</a>
        </li>
        <li>
          <a href="#about" className="no-underline opacity-90 hover:opacity-100">About</a>
        </li>
        <li>
          <a href="#contact" className="no-underline opacity-90 hover:opacity-100">Contact</a>
        </li>
      </ul>
      <a
        href="#contact"
        className="hidden md:inline-flex items-center justify-center px-[var(--spacing-17)] py-[var(--spacing-8)] rounded-[var(--radius-link)] border border-white/70 hover:bg-white hover:text-black transition-colors no-underline text-[var(--text-caption)]"
      >
        Get in touch
      </a>
    </nav>
  );
}
