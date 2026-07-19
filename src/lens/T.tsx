import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLensRegistry } from './useLensRegistry';

type Props = {
  en: ReactNode;
  ru: ReactNode;
  className?: string;
  block?: boolean;
  /**
   * Swap mode for multi-line text. Instead of the partial circular mask
   * (which breaks when EN and RU wrap at different points), the whole
   * element cross-fades EN → RU once the lens overlaps it.
   */
  swap?: boolean;
};

/**
 * Bilingual text wrapper.
 *
 * The wrapper element is registered with `LensProvider`, which writes the
 * mouse position into `--tlens-x` / `--tlens-y` (in the wrapper's local
 * coordinate space). Both child layers inherit those custom properties:
 *
 *   - `.tlens__en` is masked OUT inside the lens circle (so the English
 *     disappears under the lens).
 *   - `.tlens__ru` is clipped TO the same circle and given a chromatic-
 *     aberration filter (so only Russian, with a glass-refraction look,
 *     appears inside the lens).
 *
 * This guarantees clean replacement instead of the two languages stacking.
 */
export function T({ en, ru, className, block, swap }: Props) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const { register } = useLensRegistry();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    return register(el);
  }, [register]);

  // Swap mode: RU wraps on its own, so a longer translation can end up
  // taller than the EN block and overlap the content below. Fit RU into
  // the EN box by shrinking its font-size (sqrt heuristic: both line
  // width and line count scale with font-size, so height ~ size²).
  useEffect(() => {
    if (!swap) return;
    const el = wrapperRef.current;
    if (!el) return;
    const enEl = el.querySelector<HTMLElement>('.tlens__en');
    const ruEl = el.querySelector<HTMLElement>('.tlens__ru');
    if (!enEl || !ruEl) return;

    const fit = () => {
      ruEl.style.fontSize = '';
      const enH = enEl.offsetHeight;
      if (!enH) return;
      let scale = 1;
      for (let i = 0; i < 2 && ruEl.offsetHeight > enH + 1; i++) {
        scale = Math.max(0.55, scale * Math.sqrt(enH / ruEl.offsetHeight));
        ruEl.style.fontSize = `calc(1em * ${scale.toFixed(3)})`;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(enEl);
    return () => ro.disconnect();
  }, [swap]);

  return (
    <span
      ref={wrapperRef}
      data-tlens-swap={swap ? '' : undefined}
      className={`tlens${block || swap ? ' tlens-block' : ''}${swap ? ' tlens-swap' : ''}${className ? ' ' + className : ''}`}
    >
      <span className="tlens__en">{en}</span>
      <span className="tlens__ru" aria-hidden="true">
        {ru}
      </span>
    </span>
  );
}
